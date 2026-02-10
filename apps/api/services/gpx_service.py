"""
GPX Parser - Parse GPX (GPS Exchange Format) to GeoJSON.

Uses gpxpy library to parse GPX files.
"""

import gpxpy
import gpxpy.gpx
from typing import Dict, Any


def parse_gpx_to_geojson(gpx_content: bytes) -> Dict[str, Any]:
    """
    Parse GPX file to GeoJSON FeatureCollection.

    Extracts:
    - Waypoints as Point features
    - Tracks as LineString features
    - Track segments as separate LineString features

    Args:
        gpx_content: GPX file content

    Returns:
        GeoJSON FeatureCollection dict

    Raises:
        ValueError: If GPX is invalid or parsing fails
    """
    try:
        gpx_string = gpx_content.decode('utf-8')
        gpx = gpxpy.parse(gpx_string)

        features = []

        # Extract waypoints
        for waypoint in gpx.waypoints:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        waypoint.longitude,
                        waypoint.latitude,
                        waypoint.elevation if waypoint.elevation else 0.0
                    ]
                },
                "properties": {
                    "name": waypoint.name or "",
                    "description": waypoint.description or "",
                    "type": "waypoint"
                }
            }
            features.append(feature)

        # Extract tracks
        for track in gpx.tracks:
            for segment in track.segments:
                if len(segment.points) < 2:
                    continue

                coordinates = [
                    [point.longitude, point.latitude, point.elevation if point.elevation else 0.0]
                    for point in segment.points
                ]

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordinates
                    },
                    "properties": {
                        "name": track.name or "",
                        "description": track.description or "",
                        "type": "track"
                    }
                }
                features.append(feature)

        # Extract routes
        for route in gpx.routes:
            if len(route.points) < 2:
                continue

            coordinates = [
                [point.longitude, point.latitude, point.elevation if point.elevation else 0.0]
                for point in route.points
            ]

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordinates
                },
                "properties": {
                    "name": route.name or "",
                    "description": route.description or "",
                    "type": "route"
                }
            }
            features.append(feature)

        if not features:
            raise ValueError("GPX não contém waypoints, tracks ou routes válidos")

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }

        return geojson

    except Exception as e:
        raise ValueError(f"Erro ao processar GPX: {str(e)}")
