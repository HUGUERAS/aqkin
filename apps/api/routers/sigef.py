from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional

from apps.api.services.memorial_service import (
    generate_memorial_descritivo,
    generate_coordinates_table,
    calculate_perimeter,
)

router = APIRouter(prefix="/api/sigef", tags=["SIGEF"])


class SIGEFValidationRequest(BaseModel):
    geom_wkt: str
    area_hectares: float
    vertices_sirgas: List[List[float]]  # [[lon, lat], ...]


class SIGEFValidationResponse(BaseModel):
    valido: bool
    erros: List[str]
    avisos: List[str]


@router.post("/validar", response_model=SIGEFValidationResponse)
async def validar_sigef(request: SIGEFValidationRequest):
    """
    Valida geometria conforme regras SIGEF:
    - Área mínima (fração mínima de parcelamento: 0.5ha para rural)
    - Vértices em SIRGAS 2000
    - Número de vértices (3-1000)
    - Coordenadas dentro dos limites do Brasil
    """
    erros = []
    avisos = []

    # Rule 1: Minimum area (rural: 5000m² / 0.5ha)
    if request.area_hectares < 0.5:
        erros.append("Área menor que a fração mínima de parcelamento (0.5ha / 5000m²)")

    # Rule 2: Vertex count (3-1000 vertices)
    vertex_count = len(request.vertices_sirgas)
    if vertex_count < 3:
        erros.append("Polígono precisa de pelo menos 3 vértices")
    elif vertex_count > 1000:
        avisos.append("Polígono com muitos vértices (>1000) - considere simplificar")

    # Rule 3: Coordinate system (must be SIRGAS 2000)
    # Check if coordinates are in valid SIRGAS range (Brazil bounds)
    for i, vertex in enumerate(request.vertices_sirgas):
        if len(vertex) < 2:
            erros.append(f"Vértice {i+1} com formato inválido")
            continue

        lon, lat = vertex[0], vertex[1]

        # Brazil bounds: longitude -75 to -34, latitude -34 to 6
        if not (-75 <= lon <= -34):
            erros.append(
                f"Vértice {i+1}: longitude {lon:.6f} fora dos limites do Brasil (-75 a -34)"
            )
        if not (-34 <= lat <= 6):
            erros.append(
                f"Vértice {i+1}: latitude {lat:.6f} fora dos limites do Brasil (-34 a 6)"
            )

    # Rule 4: Check for duplicate vertices
    unique_vertices = set()
    for i, vertex in enumerate(request.vertices_sirgas):
        if len(vertex) >= 2:
            vertex_tuple = (round(vertex[0], 6), round(vertex[1], 6))
            if vertex_tuple in unique_vertices:
                avisos.append(f"Vértice {i+1} pode ser duplicado")
            unique_vertices.add(vertex_tuple)

    # Rule 5: Check WKT format is provided
    if not request.geom_wkt or not request.geom_wkt.strip():
        erros.append("Geometria WKT não fornecida")
    elif not any(request.geom_wkt.upper().startswith(geom_type) for geom_type in ['POLYGON', 'MULTIPOLYGON']):
        erros.append("Geometria deve ser POLYGON ou MULTIPOLYGON")

    # Rule 6: Area consistency check
    # Calculate approximate area from vertices and compare with provided area
    if vertex_count >= 3:
        # Simple area calculation using shoelace formula (planar approximation)
        area_m2 = 0
        for i in range(vertex_count):
            j = (i + 1) % vertex_count
            if len(request.vertices_sirgas[i]) >= 2 and len(request.vertices_sirgas[j]) >= 2:
                lon1, lat1 = request.vertices_sirgas[i][0], request.vertices_sirgas[i][1]
                lon2, lat2 = request.vertices_sirgas[j][0], request.vertices_sirgas[j][1]

                # Convert to meters (rough approximation at equator)
                # 1 degree latitude ≈ 111,320 meters
                # 1 degree longitude ≈ 111,320 * cos(latitude) meters
                import math
                avg_lat = (lat1 + lat2) / 2
                x1 = lon1 * 111320 * math.cos(math.radians(avg_lat))
                y1 = lat1 * 111320
                x2 = lon2 * 111320 * math.cos(math.radians(avg_lat))
                y2 = lat2 * 111320

                area_m2 += x1 * y2 - x2 * y1

        area_m2 = abs(area_m2) / 2
        area_ha = area_m2 / 10000

        # Check if calculated area is close to provided area (within 5% tolerance)
        if abs(area_ha - request.area_hectares) / request.area_hectares > 0.05:
            avisos.append(
                f"Área calculada ({area_ha:.4f}ha) difere da área fornecida ({request.area_hectares:.4f}ha) em mais de 5%"
            )

    return SIGEFValidationResponse(
        valido=len(erros) == 0,
        erros=erros,
        avisos=avisos
    )


# ---------- Memorial Descritivo ----------


class MemorialRequest(BaseModel):
    vertices: List[List[float]]  # [[lon, lat], ...]
    area_m2: float
    confrontantes: Optional[Dict[str, str]] = None  # {NORTE: "nome", ...}


class VerticesSIRGASRequest(BaseModel):
    vertices: List[List[float]]  # [[lon, lat], ...]


@router.post("/memorial")
async def memorial_descritivo(request: MemorialRequest):
    """
    Gera memorial descritivo do imóvel a partir dos vértices,
    área e confrontantes informados.
    """
    try:
        perimeter = calculate_perimeter(request.vertices)
        texto = generate_memorial_descritivo(
            vertices=request.vertices,
            area=request.area_m2,
            perimeter=perimeter,
            confrontantes=request.confrontantes,
        )
        return {"memorial": texto}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/vertices-sirgas")
async def vertices_sirgas(request: VerticesSIRGASRequest):
    """
    Retorna tabela de vértices formatada no sistema SIRGAS 2000.
    """
    try:
        tabela = generate_coordinates_table(request.vertices)
        return {"tabela": tabela}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
