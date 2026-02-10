"""
DXF Exporter - Generate DXF (AutoCAD) from GeoJSON geometries.

Uses ezdxf library to generate DXF files (R2010 format).
"""

import ezdxf
from typing import Dict, Any, List
import io


def generate_dxf(geometries: List[Dict[str, Any]]) -> str:
    """
    Generate DXF file from GeoJSON geometries.

    Supports:
    - Point
    - LineString (polyline)
    - Polygon (closed polyline)
    - MultiPoint
    - MultiLineString
    - MultiPolygon

    Args:
        geometries: List of GeoJSON geometry dicts

    Returns:
        DXF file content as string

    Raises:
        ValueError: If geometry type is not supported
    """
    try:
        # Create new DXF document (R2010)
        doc = ezdxf.new('R2010')
        msp = doc.modelspace()

        # Process each geometry
        for geometry in geometries:
            geom_type = geometry.get("type")
            coords = geometry.get("coordinates", [])

            if not geom_type or not coords:
                continue

            if geom_type == "Point":
                add_point_to_dxf(msp, coords)

            elif geom_type == "LineString":
                add_linestring_to_dxf(msp, coords)

            elif geom_type == "Polygon":
                add_polygon_to_dxf(msp, coords)

            elif geom_type == "MultiPoint":
                for coord in coords:
                    add_point_to_dxf(msp, coord)

            elif geom_type == "MultiLineString":
                for line_coords in coords:
                    add_linestring_to_dxf(msp, line_coords)

            elif geom_type == "MultiPolygon":
                for polygon_coords in coords:
                    add_polygon_to_dxf(msp, polygon_coords)

            else:
                raise ValueError(f"Tipo de geometria não suportado: {geom_type}")

        # Write to string
        output = io.StringIO()
        doc.write(output)
        dxf_content = output.getvalue()
        output.close()

        return dxf_content

    except Exception as e:
        raise ValueError(f"Erro ao gerar DXF: {str(e)}")


def add_point_to_dxf(msp, coords: List[float]):
    """
    Add Point to DXF modelspace.

    Args:
        msp: DXF modelspace
        coords: [x, y] or [x, y, z]
    """
    x = coords[0]
    y = coords[1]
    z = coords[2] if len(coords) > 2 else 0.0

    msp.add_point((x, y, z))


def add_linestring_to_dxf(msp, coords: List[List[float]]):
    """
    Add LineString to DXF modelspace as LWPOLYLINE.

    Args:
        msp: DXF modelspace
        coords: [[x, y], [x, y], ...]
    """
    if len(coords) < 2:
        return

    points = [(coord[0], coord[1]) for coord in coords]
    msp.add_lwpolyline(points, close=False)


def add_polygon_to_dxf(msp, coords: List[List[List[float]]]):
    """
    Add Polygon to DXF modelspace as closed LWPOLYLINE.

    Polygon coordinates: [exterior_ring, hole1, hole2, ...]
    We only export the exterior ring for simplicity.

    Args:
        msp: DXF modelspace
        coords: [[[x, y], [x, y], ...], ...]
    """
    if not coords or len(coords[0]) < 3:
        return

    # Export exterior ring only
    exterior_ring = coords[0]
    points = [(coord[0], coord[1]) for coord in exterior_ring]

    # Close the polyline
    msp.add_lwpolyline(points, close=True)

    # Optionally export holes (interior rings)
    for hole in coords[1:]:
        hole_points = [(coord[0], coord[1]) for coord in hole]
        msp.add_lwpolyline(hole_points, close=True)
