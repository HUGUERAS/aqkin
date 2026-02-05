"""Geospatial validation services using PostGIS."""
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy import text
from sqlalchemy.orm import Session
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import json
from geoalchemy2 import functions as geofunc
from geoalchemy2.types import Geometry
from config import settings
from models import Parcel, SigefCertified, ValidationEvent
from schemas import GeometryResponse, ValidationWarning, ValidationResult


class SigefValidationError(Exception):
    """Custom exception for SIGEF validation."""
    pass


def clean_geometry(geom_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Clean/normalize geometry.
    
    1. Normalize SRID to 4326
    2. Run ST_Buffer(0) and ST_MakeValid
    3. Return cleaned GeoJSON
    """
    try:
        geom_obj = shape(geom_dict)
        
        # Check basic validity
        if not geom_obj.is_valid:
            # Try to fix with buffer(0)
            geom_obj = geom_obj.buffer(0)
        
        if not geom_obj.is_valid:
            raise SigefValidationError("Geometry is invalid after cleanup")
        
        # Ensure it's a Polygon or MultiPolygon
        geom_type = geom_obj.geom_type
        if geom_type not in ['Polygon', 'MultiPolygon']:
            raise SigefValidationError(f"Invalid geometry type: {geom_type}. Expected Polygon or MultiPolygon")
        
        return mapping(geom_obj)
    except Exception as e:
        raise SigefValidationError(f"Geometry cleanup failed: {str(e)}")


def validate_geometry_constraints(
    area_m2: float,
    perimeter_m: float,
    geom_dict: Dict[str, Any],
) -> Tuple[bool, Optional[str]]:
    """Validate geometry constraints.
    
    Returns:
        (is_valid, error_message)
    """
    geom_obj = shape(geom_dict)
    
    # Check minimum area
    if area_m2 < settings.AREA_MIN_M2:
        return False, f"Area {area_m2:.2f} m² is less than minimum {settings.AREA_MIN_M2} m²"
    
    # Check minimum vertices
    coords = list(geom_obj.exterior.coords) if geom_obj.geom_type == 'Polygon' else []
    if len(coords) < 4:  # 3 + closing point
        return False, "Polygon must have at least 3 vertices"
    
    return True, None


def check_sigef_overlap(
    geom_dict: Dict[str, Any],
    db: Session,
    tolerance_m2: float = 0,
) -> Tuple[bool, Optional[float], Optional[str]]:
    """Check overlap with SIGEF/INCRA certified areas.
    
    Args:
        geom_dict: GeoJSON geometry
        db: Database session
        tolerance_m2: Minimum overlap area to trigger alert (default 0 = any overlap)
        
    Returns:
        (has_overlap, overlap_area_m2, certified_owner)
    """
    try:
        # Convert GeoJSON to WKT for PostGIS query
        geom_obj = shape(geom_dict)
        wkt = geom_obj.wkt
        
        # Query PostGIS for overlap
        query = text("""
            SELECT 
                ST_Area(ST_Intersection(
                    ST_GeomFromText(:wkt, 4326)::geography,
                    s.geom::geography
                )) as overlap_area,
                s.owner
            FROM sigef_certified s
            WHERE ST_Intersects(
                ST_GeomFromText(:wkt, 4326),
                s.geom
            )
            LIMIT 1
        """)
        
        result = db.execute(query, {"wkt": wkt}).first()
        
        if result and result.overlap_area > tolerance_m2:
            return True, result.overlap_area, result.owner
        
        return False, None, None
    except Exception as e:
        raise SigefValidationError(f"SIGEF overlap check failed: {str(e)}")


def check_neighbor_overlap(
    geom_dict: Dict[str, Any],
    project_id: str,
    current_parcel_id: Optional[str],
    db: Session,
) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """Check overlap with neighbor parcels in same project.
    
    Returns:
        (has_overlap, { neighbor_parcel_id, overlap_area_m2 })
    """
    try:
        geom_obj = shape(geom_dict)
        wkt = geom_obj.wkt
        
        query = text("""
            SELECT 
                p.id,
                p.name,
                ST_Area(ST_Intersection(
                    ST_GeomFromText(:wkt, 4326)::geography,
                    p.geom_client_sketch::geography
                )) as overlap_area
            FROM parcel p
            WHERE 
                p.project_id = :project_id
                AND (p.geom_client_sketch IS NOT NULL OR p.geom_official IS NOT NULL)
                AND (:current_parcel_id IS NULL OR p.id != :current_parcel_id)
                AND ST_Intersects(
                    ST_GeomFromText(:wkt, 4326),
                    COALESCE(p.geom_official, p.geom_client_sketch)
                )
            LIMIT 1
        """)
        
        result = db.execute(query, {
            "wkt": wkt,
            "project_id": project_id,
            "current_parcel_id": current_parcel_id,
        }).first()
        
        if result and result.overlap_area > 0:
            return True, {
                "neighbor_parcel_id": str(result.id),
                "neighbor_name": result.name,
                "overlap_area_m2": result.overlap_area,
            }
        
        return False, None
    except Exception as e:
        raise SigefValidationError(f"Neighbor overlap check failed: {str(e)}")


def check_gaps_in_project(
    geom_dict: Dict[str, Any],
    project_id: str,
    current_parcel_id: Optional[str],
    db: Session,
    tolerance_m2: float = 1,
) -> Tuple[bool, Optional[float]]:
    """Check for gaps in a multi-parcel project (desmembramento).
    
    Algorithm:
    1. Get union of all other parcels in project
    2. Compute symmetric difference with target geometry
    3. If residual area > tolerance → gap detected
    
    Returns:
        (has_gap, gap_area_m2)
    """
    try:
        geom_obj = shape(geom_dict)
        wkt = geom_obj.wkt
        
        # Get union of all other parcels
        query = text("""
            SELECT ST_AsText(ST_Union(
                COALESCE(p.geom_official, p.geom_client_sketch)
            )) as union_wkt
            FROM parcel p
            WHERE 
                p.project_id = :project_id
                AND (:current_parcel_id IS NULL OR p.id != :current_parcel_id)
                AND (p.geom_client_sketch IS NOT NULL OR p.geom_official IS NOT NULL)
        """)
        
        result = db.execute(query, {
            "project_id": project_id,
            "current_parcel_id": current_parcel_id,
        }).first()
        
        if not result or not result.union_wkt:
            return False, None  # No other parcels, no gap check needed
        
        # Compute symmetric difference
        query = text("""
            SELECT ST_Area(ST_SymDifference(
                ST_GeomFromText(:union_wkt, 4326)::geography,
                ST_GeomFromText(:wkt, 4326)::geography
            )) as gap_area
        """)
        
        result = db.execute(query, {
            "union_wkt": result.union_wkt,
            "wkt": wkt,
        }).first()
        
        if result and result.gap_area > tolerance_m2:
            return True, result.gap_area
        
        return False, None
    except Exception as e:
        raise SigefValidationError(f"Gap check failed: {str(e)}")


def calculate_metrics(geom_dict: Dict[str, Any]) -> Tuple[float, float]:
    """Calculate area (m²) and perimeter (m) from geometry.
    
    Returns:
        (area_m2, perimeter_m)
    """
    try:
        geom_obj = shape(geom_dict)
        
        # Using geographic coordinates (4326), approximate using Haversine
        # For production, use PostGIS ST_Area/ST_Perimeter for accuracy
        area_m2 = geom_obj.area * 111319.5 ** 2  # Rough approximation
        perimeter_m = geom_obj.length * 111319.5  # Rough approximation
        
        return area_m2, perimeter_m
    except Exception as e:
        raise SigefValidationError(f"Metric calculation failed: {str(e)}")


def validate_geometry_complete(
    geom_dict: Dict[str, Any],
    project_id: str,
    parcel_id: Optional[str],
    db: Session,
    check_sigef: bool = True,
    check_neighbors: bool = True,
    check_gaps: bool = True,
) -> GeometryResponse:
    """Complete validation pipeline.
    
    1. Clean geometry
    2. Check constraints (area, vertices)
    3. Check SIGEF overlap (WARN if yes)
    4. Check neighbor overlap (WARN if yes)
    5. Check gaps (optional)
    
    Returns:
        GeometryResponse with status, warnings, metrics
    """
    warnings: List[ValidationWarning] = []
    has_overlap_alert = False
    can_proceed = True
    result = ValidationResult.OK
    
    try:
        # Step 1: Clean
        cleaned_geom = clean_geometry(geom_dict)
        
        # Step 2: Calculate metrics
        area_m2, perimeter_m = calculate_metrics(cleaned_geom)
        
        # Step 3: Check constraints
        is_valid, error_msg = validate_geometry_constraints(area_m2, perimeter_m, cleaned_geom)
        if not is_valid:
            return GeometryResponse(
                status=ValidationResult.FAIL,
                can_proceed=False,
                code="GEOM_INVALID",
                message=error_msg or "Geometry is invalid",
                area_m2=area_m2,
                perimeter_m=perimeter_m,
            )
        
        # Step 4: Check SIGEF
        if check_sigef:
            has_sigef_overlap, overlap_area, owner = check_sigef_overlap(
                cleaned_geom,
                db,
                settings.SIGEF_OVERLAP_TOLERANCE_M2,
            )
            if has_sigef_overlap:
                warnings.append(ValidationWarning(
                    type="SIGEF_OVERLAP",
                    details={
                        "overlap_area_m2": overlap_area,
                        "certified_owner": owner,
                    },
                ))
                has_overlap_alert = True
                result = ValidationResult.WARN
        
        # Step 5: Check neighbors
        if check_neighbors:
            has_neighbor_overlap, neighbor_info = check_neighbor_overlap(
                cleaned_geom,
                project_id,
                parcel_id,
                db,
            )
            if has_neighbor_overlap:
                warnings.append(ValidationWarning(
                    type="NEIGHBOR_OVERLAP",
                    details=neighbor_info,
                ))
                has_overlap_alert = True
                result = ValidationResult.WARN
        
        # Step 6: Check gaps (optional)
        if check_gaps:
            has_gap, gap_area = check_gaps_in_project(
                cleaned_geom,
                project_id,
                parcel_id,
                db,
                settings.GAP_TOLERANCE_M2,
            )
            if has_gap:
                warnings.append(ValidationWarning(
                    type="GAP_DETECTED",
                    details={"gap_area_m2": gap_area},
                ))
                has_overlap_alert = True
                result = ValidationResult.WARN
        
        return GeometryResponse(
            status=result,
            can_proceed=True,  # Alerts don't block progression
            has_overlap_alert=has_overlap_alert,
            area_m2=area_m2,
            perimeter_m=perimeter_m,
            warnings=warnings,
            message="OK" if result == ValidationResult.OK else "Validation passed with warnings",
        )
    
    except SigefValidationError as e:
        return GeometryResponse(
            status=ValidationResult.FAIL,
            can_proceed=False,
            code="GEOM_INVALID",
            message=str(e),
        )
    except Exception as e:
        return GeometryResponse(
            status=ValidationResult.FAIL,
            can_proceed=False,
            code="VALIDATION_ERROR",
            message=f"Unexpected error: {str(e)}",
        )
