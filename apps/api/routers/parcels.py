"""Router for parcel/lote operations including layer management and validation."""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from geoalchemy2 import shape
from geoalchemy2.elements import WKBElement
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import logging

from database import get_db
from models import Parcel, Project, User
from schemas import ParcelStatus, SketchStatus
from services.geo import validate_geometry_complete

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/parcels", tags=["parcels"])


# ============ Schemas ============
class LayerData(dict):
    """Layer data with geometry and metadata."""
    pass


class LayersResponse(dict):
    """Response containing all 4 layers for validation page."""
    pass


class ValidateTopographyRequest(dict):
    """Request to validate parcel topography."""
    pass


class ValidateTopographyResponse(dict):
    """Response after validation."""
    pass


# ============ Utility Functions ============
def geometry_to_geojson(geom: WKBElement) -> Optional[Dict[str, Any]]:
    """Convert PostGIS WKBElement to GeoJSON dictionary."""
    if not geom:
        return None
    
    try:
        # Use Shapely to convert WKB to GeoJSON-like structure
        shapely_geom = shape.to_shape(geom)
        
        # Return GeoJSON representation
        if shapely_geom.geom_type == 'Polygon':
            coords = list(shapely_geom.exterior.coords)
            return {
                "type": "Polygon",
                "coordinates": [coords]
            }
        elif shapely_geom.geom_type == 'MultiPolygon':
            coords = [list(poly.exterior.coords) for poly in shapely_geom.geoms]
            return {
                "type": "MultiPolygon",
                "coordinates": coords
            }
        else:
            return {
                "type": shapely_geom.geom_type,
                "coordinates": list(shapely_geom.coords)
            }
    except Exception as e:
        logger.error(f"Error converting geometry to GeoJSON: {e}")
        return None


def get_neighbor_parcels(db: Session, parcel: Parcel) -> List[Parcel]:
    """Get neighboring parcels that share boundaries or overlap."""
    if not parcel.geom_official and not parcel.geom_client_sketch:
        return []
    
    # Use geometry from official or client sketch
    geom = parcel.geom_official or parcel.geom_client_sketch
    
    try:
        # Query for parcels that touch or intersect (ST_Intersects, ST_Touches)
        neighbors = db.query(Parcel).filter(
            and_(
                Parcel.project_id == parcel.project_id,
                Parcel.id != parcel.id,
                func.st_intersects(Parcel.geom_official or Parcel.geom_client_sketch, geom)
            )
        ).all()
        
        return neighbors
    except Exception as e:
        logger.warning(f"Could not query neighbors: {e}")
        return []


def detect_overlaps(db: Session, parcel: Parcel) -> List[Dict[str, Any]]:
    """Detect overlaps with neighboring parcels."""
    overlaps = []
    
    if not parcel.geom_official and not parcel.geom_client_sketch:
        return overlaps
    
    geom = parcel.geom_official or parcel.geom_client_sketch
    
    try:
        # Find neighbors
        neighbors = get_neighbor_parcels(db, parcel)
        
        for neighbor in neighbors:
            neighbor_geom = neighbor.geom_official or neighbor.geom_client_sketch
            if not neighbor_geom:
                continue
            
            # Check for overlap (not just touching)
            overlap_exists = db.query(
                func.st_intersects(geom, neighbor_geom)
            ).scalar()
            
            if overlap_exists:
                # Calculate overlap area
                overlap_geom = db.query(
                    func.st_intersection(geom, neighbor_geom)
                ).scalar()
                
                overlap_area = 0
                if overlap_geom:
                    try:
                        overlap_area = db.query(
                            func.st_area(overlap_geom, true)  # Use geography for accurate area
                        ).scalar() or 0
                    except:
                        pass
                
                overlaps.append({
                    "parcel_id": str(neighbor.id),
                    "parcel_name": neighbor.name,
                    "overlap_area_m2": round(overlap_area, 2)
                })
    except Exception as e:
        logger.warning(f"Error detecting overlaps: {e}")
    
    return overlaps


# ============ Endpoints ============

@router.get("/{parcel_id}/layers", response_model=Dict[str, Any])
async def get_parcel_layers(
    parcel_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all 4 validation layers for a parcel.
    
    Returns layers with geometries and metadata for the ValidarDesenhos page.
    Layers: cliente (client sketch), oficial (official), sobreposições (overlaps), limites (boundaries)
    
    Args:
        parcel_id: UUID of the parcel
    
    Returns:
        Dict with layer data including geometries and metadata
    
    Example response:
        {
          "cliente": {
            "id": "cliente",
            "label": "Desenho Cliente",
            "color": "#999999",
            "visible": true,
            "opacity": 50,
            "graphics": [{
              "geometry": {...},
              "type": "polygon"
            }]
          },
          "oficial": {...},
          "sobreposicoes": {...},
          "limites": {...}
        }
    """
    try:
        # Fetch parcel from database
        parcel = db.query(Parcel).filter_by(id=parcel_id).first()
        
        if not parcel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parcel {parcel_id} not found"
            )
        
        # Get neighbors for overlap/boundary visualization
        neighbors = get_neighbor_parcels(db, parcel)
        
        # Build layers response
        layers = {
            "cliente": {
                "id": "cliente",
                "label": "Desenho Cliente",
                "description": "Desenho initial do cliente",
                "color": "#999999",
                "visible": True,
                "opacity": 50,
                "graphics": []
            },
            "oficial": {
                "id": "oficial",
                "label": "Geometria Oficial",
                "description": "Geometria ajustada pelo topógrafo",
                "color": "#667eea",
                "visible": True,
                "opacity": 100,
                "graphics": []
            },
            "sobreposicoes": {
                "id": "sobreposicoes",
                "label": "Sobreposições",
                "description": "Áreas que se sobrepõem com vizinhos",
                "color": "#f44336",
                "visible": False,
                "opacity": 70,
                "graphics": []
            },
            "limites": {
                "id": "limites",
                "label": "Limites Compartilhados",
                "description": "Limites compartilhados com vizinhos",
                "color": "#4caf50",
                "visible": False,
                "opacity": 80,
                "graphics": []
            }
        }
        
        # Add client sketch geometry
        if parcel.geom_client_sketch:
            client_geojson = geometry_to_geojson(parcel.geom_client_sketch)
            if client_geojson:
                layers["cliente"]["graphics"].append({
                    "geometry": client_geojson,
                    "type": "polygon",
                    "parcel_id": str(parcel.id)
                })
        
        # Add official geometry
        if parcel.geom_official:
            official_geojson = geometry_to_geojson(parcel.geom_official)
            if official_geojson:
                layers["oficial"]["graphics"].append({
                    "geometry": official_geojson,
                    "type": "polygon",
                    "parcel_id": str(parcel.id)
                })
        
        # Add neighbor geometries for overlap visualization
        for neighbor in neighbors:
            neighbor_geom = neighbor.geom_official or neighbor.geom_client_sketch
            if neighbor_geom:
                neighbor_geojson = geometry_to_geojson(neighbor_geom)
                if neighbor_geojson:
                    layers["limites"]["graphics"].append({
                        "geometry": neighbor_geojson,
                        "type": "polygon",
                        "parcel_id": str(neighbor.id),
                        "parcel_name": neighbor.name
                    })
        
        # Metadata
        layers["metadata"] = {
            "parcel_id": str(parcel.id),
            "parcel_name": parcel.name,
            "project_id": str(parcel.project_id),
            "status": parcel.status,
            "sketch_status": parcel.sketch_status,
            "has_overlap_alert": parcel.has_overlap_alert,
            "area_m2": parcel.area_m2 or 0,
            "perimeter_m": parcel.perimeter_m or 0,
            "neighbor_count": len(neighbors),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return layers
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching parcel layers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch parcel layers"
        )


@router.post("/{parcel_id}/validate-topography", response_model=Dict[str, Any])
async def validate_parcel_topography(
    parcel_id: str,
    request: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db)
):
    """
    Validate parcel topography and mark as validated by topographer.
    
    This endpoint:
    1. Validates the parcel geometry is complete
    2. Detects overlaps with neighbors
    3. Updates parcel status to SKETCH_APPROVED
    4. Records topographer validation timestamp
    
    Args:
        parcel_id: UUID of the parcel
        request: Optional validation details (notes, etc)
    
    Returns:
        Validation result with status and any detected issues
    """
    try:
        # Fetch parcel
        parcel = db.query(Parcel).filter_by(id=parcel_id).first()
        
        if not parcel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parcel {parcel_id} not found"
            )
        
        # Validate geometry
        validation_result = validate_geometry_complete(parcel)
        
        if not validation_result.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geometry validation failed: {validation_result.get('errors', [])}"
            )
        
        # Detect overlaps
        overlaps = detect_overlaps(db, parcel)
        
        # Update parcel status
        parcel.sketch_status = "approved"
        parcel.status = "SKETCH_APPROVED"
        parcel.reviewed_by_topografo_at = datetime.utcnow()
        parcel.has_overlap_alert = len(overlaps) > 0
        
        if request and isinstance(request, dict):
            parcel.reviewed_notes = request.get("notes", "")
        
        db.add(parcel)
        db.commit()
        db.refresh(parcel)
        
        return {
            "status": "success",
            "parcel_id": str(parcel.id),
            "validation_status": parcel.sketch_status,
            "geometry_valid": validation_result.get("valid"),
            "geometry_area_m2": validation_result.get("area_m2", 0),
            "geometry_perimeter_m": validation_result.get("perimeter_m", 0),
            "overlaps_detected": overlaps,
            "has_overlap_alert": len(overlaps) > 0,
            "validated_at": parcel.reviewed_by_topografo_at.isoformat() if parcel.reviewed_by_topografo_at else None,
            "message": f"Parcel '{parcel.name}' validated successfully" + (
                f" with {len(overlaps)} overlap(s) detected" if overlaps else ""
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating parcel topography: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate parcel topography"
        )


@router.get("/{parcel_id}/overlaps", response_model=List[Dict[str, Any]])
async def get_parcel_overlaps(
    parcel_id: str,
    db: Session = Depends(get_db)
):
    """
    Get list of overlapping neighbors for a parcel.
    
    Returns detailed overlap information for conflict resolution.
    """
    try:
        parcel = db.query(Parcel).filter_by(id=parcel_id).first()
        
        if not parcel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parcel {parcel_id} not found"
            )
        
        overlaps = detect_overlaps(db, parcel)
        return overlaps
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching parcel overlaps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch parcel overlaps"
        )
