from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List, Any
import io
import json

from apps.api.services.kml_service import parse_kml_to_geojson
from apps.api.services.shapefile_service import parse_shapefile_to_geojson
from apps.api.services.gpx_service import parse_gpx_to_geojson
from apps.api.services.dxf_service import generate_dxf

router = APIRouter(prefix="/api/import-export", tags=["Import/Export"])


class GeoJSONExportRequest(BaseModel):
    geometry: Dict[str, Any]  # GeoJSON geometry object


class DXFExportRequest(BaseModel):
    geometries: List[Dict[str, Any]]  # List of GeoJSON geometry objects


@router.post("/import/kml")
async def import_kml(file: UploadFile = File(...)):
    """
    Import KML/KMZ file and convert to GeoJSON.

    Supports:
    - KML (Google Earth)
    - KMZ (compressed KML)

    Returns GeoJSON FeatureCollection.
    """
    try:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Arquivo vazio")

        geojson = parse_kml_to_geojson(content)
        return geojson

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar KML: {str(e)}")


@router.post("/import/shapefile")
async def import_shapefile(file: UploadFile = File(...)):
    """
    Import Shapefile (as ZIP) and convert to GeoJSON.

    ZIP must contain:
    - .shp (geometry)
    - .shx (index)
    - .dbf (attributes)

    Returns GeoJSON FeatureCollection.
    """
    try:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Arquivo vazio")

        if not file.filename.endswith('.zip'):
            raise HTTPException(
                status_code=400,
                detail="Shapefile deve ser enviado como arquivo ZIP contendo .shp, .shx e .dbf"
            )

        geojson = parse_shapefile_to_geojson(content)
        return geojson

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar Shapefile: {str(e)}"
        )


@router.post("/import/gpx")
async def import_gpx(file: UploadFile = File(...)):
    """
    Import GPX file and convert to GeoJSON.

    Extracts:
    - Waypoints (Point)
    - Tracks/Segments (LineString)

    Returns GeoJSON FeatureCollection.
    """
    try:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Arquivo vazio")

        geojson = parse_gpx_to_geojson(content)
        return geojson

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar GPX: {str(e)}")


@router.post("/export/dxf")
async def export_dxf(request: DXFExportRequest):
    """
    Export GeoJSON geometries to DXF (AutoCAD) format.

    Supports:
    - Polygon (closed polyline)
    - LineString (polyline)
    - Point

    Returns DXF file (R2010 format).
    """
    try:
        if not request.geometries:
            raise HTTPException(
                status_code=400,
                detail="Lista de geometrias não pode estar vazia"
            )

        dxf_content = generate_dxf(request.geometries)

        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(dxf_content.encode('utf-8')),
            media_type="application/dxf",
            headers={"Content-Disposition": "attachment; filename=export.dxf"}
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar DXF: {str(e)}")


@router.post("/export/geojson")
async def export_geojson(request: GeoJSONExportRequest):
    """
    Export geometry to GeoJSON format.

    Simple wrapper that validates and formats geometry as GeoJSON Feature.
    """
    try:
        feature = {
            "type": "Feature",
            "geometry": request.geometry,
            "properties": {}
        }

        # Validate geometry has required fields
        if "type" not in request.geometry or "coordinates" not in request.geometry:
            raise HTTPException(
                status_code=400,
                detail="Geometria inválida: deve conter 'type' e 'coordinates'"
            )

        return StreamingResponse(
            io.BytesIO(json.dumps(feature, indent=2).encode('utf-8')),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=export.geojson"}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar GeoJSON: {str(e)}")
