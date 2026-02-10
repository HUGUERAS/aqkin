"""
Shapefile Parser - Parse ESRI Shapefile (ZIP) to GeoJSON.

Uses pyshp library to read .shp, .shx, and .dbf files.
"""

import zipfile
import io
import shapefile
from typing import Dict, Any, List


def parse_shapefile_to_geojson(zip_content: bytes) -> Dict[str, Any]:
    """
    Parse Shapefile (as ZIP) to GeoJSON FeatureCollection.

    Args:
        zip_content: ZIP file content containing .shp, .shx, .dbf

    Returns:
        GeoJSON FeatureCollection dict

    Raises:
        ValueError: If ZIP is invalid or missing required files
    """
    try:
        # Extract files from ZIP
        zip_buffer = io.BytesIO(zip_content)

        with zipfile.ZipFile(zip_buffer, 'r') as zip_ref:
            namelist = zip_ref.namelist()

            # Find .shp file
            shp_files = [name for name in namelist if name.lower().endswith('.shp')]
            if not shp_files:
                raise ValueError("ZIP não contém arquivo .shp")

            shp_name = shp_files[0]
            base_name = shp_name[:-4]  # Remove .shp extension

            # Check for required files
            required_extensions = ['.shp', '.shx', '.dbf']
            for ext in required_extensions:
                file_exists = any(
                    name.lower() == (base_name + ext).lower()
                    for name in namelist
                )
                if not file_exists:
                    raise ValueError(
                        f"ZIP não contém arquivo {ext} necessário. "
                        f"Arquivos obrigatórios: .shp, .shx, .dbf"
                    )

            # Read shapefile
            shp_bytes = zip_ref.read(shp_name)
            shx_bytes = zip_ref.read(base_name + '.shx')
            dbf_bytes = zip_ref.read(base_name + '.dbf')

        # Parse using pyshp
        shp_buffer = io.BytesIO(shp_bytes)
        shx_buffer = io.BytesIO(shx_bytes)
        dbf_buffer = io.BytesIO(dbf_bytes)

        sf = shapefile.Reader(shp=shp_buffer, shx=shx_buffer, dbf=dbf_buffer)

        # Convert to GeoJSON
        features = []

        for shape_record in sf.shapeRecords():
            shape = shape_record.shape
            record = shape_record.record

            # Convert geometry
            geometry = shape_to_geojson_geometry(shape)

            # Extract attributes
            properties = {}
            for i, field in enumerate(sf.fields[1:]):  # Skip first field (DeletionFlag)
                field_name = field[0]
                properties[field_name] = record[i]

            feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": properties
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }

        return geojson

    except zipfile.BadZipFile:
        raise ValueError("Arquivo ZIP inválido")
    except Exception as e:
        raise ValueError(f"Erro ao processar Shapefile: {str(e)}")


def shape_to_geojson_geometry(shape) -> Dict[str, Any]:
    """
    Convert pyshp Shape to GeoJSON geometry.

    Args:
        shape: shapefile.Shape object

    Returns:
        GeoJSON geometry dict
    """
    shape_type = shape.shapeType

    # Point (1)
    if shape_type == 1:
        return {
            "type": "Point",
            "coordinates": [shape.points[0][0], shape.points[0][1]]
        }

    # Polyline (3)
    elif shape_type == 3:
        if len(shape.parts) == 1:
            return {
                "type": "LineString",
                "coordinates": [[p[0], p[1]] for p in shape.points]
            }
        else:
            # MultiLineString
            lines = []
            parts = list(shape.parts) + [len(shape.points)]
            for i in range(len(parts) - 1):
                start = parts[i]
                end = parts[i + 1]
                lines.append([[p[0], p[1]] for p in shape.points[start:end]])
            return {
                "type": "MultiLineString",
                "coordinates": lines
            }

    # Polygon (5)
    elif shape_type == 5:
        if len(shape.parts) == 1:
            return {
                "type": "Polygon",
                "coordinates": [[[p[0], p[1]] for p in shape.points]]
            }
        else:
            # MultiPolygon or Polygon with holes
            rings = []
            parts = list(shape.parts) + [len(shape.points)]
            for i in range(len(parts) - 1):
                start = parts[i]
                end = parts[i + 1]
                rings.append([[p[0], p[1]] for p in shape.points[start:end]])

            # Simple case: treat as single polygon with holes
            return {
                "type": "Polygon",
                "coordinates": rings
            }

    # MultiPoint (8)
    elif shape_type == 8:
        return {
            "type": "MultiPoint",
            "coordinates": [[p[0], p[1]] for p in shape.points]
        }

    else:
        raise ValueError(f"Tipo de geometria não suportado: {shape_type}")
