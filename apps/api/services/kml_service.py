"""
KML Parser - Parse KML/KMZ to GeoJSON.

Uses fastkml library to parse KML files.
"""

import zipfile
import io
from typing import Dict, Any
from fastkml import kml


def parse_kml_to_geojson(kml_content: bytes) -> Dict[str, Any]:
    """
    Parse KML or KMZ file to GeoJSON FeatureCollection.

    Args:
        kml_content: KML or KMZ file content

    Returns:
        GeoJSON FeatureCollection dict

    Raises:
        ValueError: If KML is invalid or parsing fails
    """
    try:
        # Check if it's KMZ (ZIP compressed)
        kml_string = None

        try:
            # Try to unzip (KMZ)
            zip_buffer = io.BytesIO(kml_content)
            with zipfile.ZipFile(zip_buffer, 'r') as zip_ref:
                # Find .kml file in ZIP
                kml_files = [name for name in zip_ref.namelist() if name.lower().endswith('.kml')]
                if not kml_files:
                    raise ValueError("KMZ não contém arquivo .kml")

                kml_string = zip_ref.read(kml_files[0]).decode('utf-8')
        except zipfile.BadZipFile:
            # Not a ZIP, assume plain KML
            kml_string = kml_content.decode('utf-8')

        if not kml_string:
            raise ValueError("Não foi possível ler o conteúdo do KML")

        # Parse KML
        k = kml.KML()
        k.from_string(kml_string.encode('utf-8'))

        features = []

        # Extract features from KML
        for document in k.features():
            features.extend(extract_features_from_container(document))

        if not features:
            raise ValueError("KML não contém features válidas")

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }

        return geojson

    except Exception as e:
        raise ValueError(f"Erro ao processar KML: {str(e)}")


def extract_features_from_container(container) -> list:
    """
    Recursively extract features from KML container (Document/Folder).

    Args:
        container: KML Document or Folder

    Returns:
        List of GeoJSON features
    """
    features = []

    for feature in container.features():
        # If it's a container (Folder), recurse
        if hasattr(feature, 'features'):
            features.extend(extract_features_from_container(feature))

        # If it's a Placemark with geometry
        elif hasattr(feature, 'geometry') and feature.geometry:
            geojson_feature = placemark_to_geojson_feature(feature)
            if geojson_feature:
                features.append(geojson_feature)

    return features


def placemark_to_geojson_feature(placemark) -> Dict[str, Any]:
    """
    Convert KML Placemark to GeoJSON Feature.

    Args:
        placemark: KML Placemark object

    Returns:
        GeoJSON Feature dict or None if geometry is invalid
    """
    try:
        geometry = placemark.geometry

        if not geometry:
            return None

        # Handle different geometry types - build coordinates per type
        # to avoid touching geometry.coords generically (fails for Polygon)
        geom_type = geometry.geom_type
        
        # Handle different geometry types
        if geom_type == "Point":
            geojson_geometry = {
                "type": "Point",
                "coordinates": list(geometry.coords[0])
            }

        elif geom_type == "LineString":
            geojson_geometry = {
                "type": "LineString",
                "coordinates": [list(coord) for coord in geometry.coords]
            }

        elif geom_type == "Polygon":
            # Exterior ring
            exterior = [list(coord) for coord in geometry.exterior.coords]
            # Interior rings (holes)
            interiors = [[list(coord) for coord in interior.coords] for interior in geometry.interiors]
            geojson_geometry = {
                "type": "Polygon",
                "coordinates": [exterior] + interiors
            }

        elif geom_type == "MultiPoint":
            geojson_geometry = {
                "type": "MultiPoint",
                "coordinates": [[geom.x, geom.y, geom.z if hasattr(geom, 'z') else 0] for geom in geometry.geoms]
            }

        elif geom_type == "MultiLineString":
            geojson_geometry = {
                "type": "MultiLineString",
                "coordinates": [
                    [list(coord) for coord in geom.coords]
                    for geom in geometry.geoms
                ]
            }

        elif geom_type == "MultiPolygon":
            geojson_geometry = {
                "type": "MultiPolygon",
                "coordinates": [
                    [[list(coord) for coord in geom.exterior.coords]]
                    for geom in geometry.geoms
                ]
            }

        else:
            return None

        # Extract properties
        properties = {
            "name": placemark.name or "",
            "description": placemark.description or ""
        }

        feature = {
            "type": "Feature",
            "geometry": geojson_geometry,
            "properties": properties
        }

        return feature

    except Exception as e:
        # Skip invalid geometries
        return None
