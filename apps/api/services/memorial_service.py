"""
Memorial Descritivo Generator - Geração de memorial descritivo para imóveis rurais.

Funções:
- Cálculo de distâncias usando fórmula de Haversine
- Cálculo de azimute (bearing) entre pontos
- Geração de texto memorial formatado conforme padrão brasileiro
"""

import math
from typing import List, Dict, Tuple, Optional


def calculate_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """
    Calcula distância entre dois pontos usando fórmula de Haversine.

    Args:
        p1: (longitude, latitude) do ponto 1 em graus
        p2: (longitude, latitude) do ponto 2 em graus

    Returns:
        Distância em metros
    """
    lon1, lat1 = p1
    lon2, lat2 = p2

    # Raio da Terra em metros
    R = 6371000

    # Converter para radianos
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    # Fórmula de Haversine
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


def calculate_azimuth(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """
    Calcula azimute (bearing) entre dois pontos.

    Azimute é o ângulo medido no sentido horário a partir do Norte:
    - 0° = Norte
    - 90° = Leste
    - 180° = Sul
    - 270° = Oeste

    Args:
        p1: (longitude, latitude) do ponto 1 em graus
        p2: (longitude, latitude) do ponto 2 em graus

    Returns:
        Azimute em graus (0-360)
    """
    lon1, lat1 = p1
    lon2, lat2 = p2

    # Converter para radianos
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon_rad = math.radians(lon2 - lon1)

    # Fórmula de bearing
    x = math.sin(dlon_rad) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon_rad)

    bearing_rad = math.atan2(x, y)
    bearing_deg = math.degrees(bearing_rad)

    # Normalizar para 0-360
    azimuth = (bearing_deg + 360) % 360

    return azimuth


def format_coordinates(lon: float, lat: float) -> str:
    """
    Formata coordenadas para exibição no memorial.

    Args:
        lon: Longitude
        lat: Latitude

    Returns:
        String formatada "E=XXX.XXXXXX, N=YY.YYYYYY"
    """
    return f"E={lon:.6f}, N={lat:.6f}"


def generate_memorial_descritivo(
    vertices: List[List[float]],
    area: float,
    perimeter: float,
    confrontantes: Optional[Dict[str, str]] = None
) -> str:
    """
    Gera memorial descritivo de imóvel rural conforme padrão brasileiro.

    Args:
        vertices: Lista de vértices [[lon, lat], ...]
        area: Área em metros quadrados
        perimeter: Perímetro em metros
        confrontantes: Dict com confrontantes (NORTE, SUL, LESTE, OESTE)

    Returns:
        Texto do memorial descritivo formatado
    """
    if len(vertices) < 3:
        raise ValueError("Memorial requer no mínimo 3 vértices")

    # Cabeçalho
    memorial = "MEMORIAL DESCRITIVO\n"
    memorial += "=" * 60 + "\n\n"

    # Área e Perímetro
    area_ha = area / 10000
    memorial += f"ÁREA: {area:.2f} m² ({area_ha:.4f} hectares)\n"
    memorial += f"PERÍMETRO: {perimeter:.2f} m\n\n"

    # Descrição do perímetro
    memorial += "DESCRIÇÃO DO PERÍMETRO:\n"
    memorial += "-" * 60 + "\n\n"

    # Garantir que o polígono está fechado
    if vertices[0] != vertices[-1]:
        vertices_closed = vertices + [vertices[0]]
    else:
        vertices_closed = vertices

    # Iterar pelos segmentos
    for i in range(len(vertices_closed) - 1):
        v_current = vertices_closed[i]
        v_next = vertices_closed[i + 1]

        p1 = (v_current[0], v_current[1])
        p2 = (v_next[0], v_next[1])

        distance = calculate_distance(p1, p2)
        azimuth = calculate_azimuth(p1, p2)

        coords_current = format_coordinates(v_current[0], v_current[1])

        memorial += f"Do vértice V{i+1} ({coords_current}) segue com azimute de "
        memorial += f"{azimuth:.2f}° por {distance:.2f}m até V{i+2};\n"

    # Confrontantes
    if confrontantes:
        memorial += "\n" + "=" * 60 + "\n\n"
        memorial += "CONFRONTANTES:\n"
        memorial += "-" * 60 + "\n\n"

        for lado in ["NORTE", "SUL", "LESTE", "OESTE"]:
            nome = confrontantes.get(lado, "Não informado")
            memorial += f"{lado}: {nome}\n"

    # Rodapé
    memorial += "\n" + "=" * 60 + "\n"
    memorial += "FIM DO MEMORIAL DESCRITIVO\n"

    return memorial


def generate_coordinates_table(vertices: List[List[float]]) -> str:
    """
    Gera tabela de coordenadas dos vértices.

    Args:
        vertices: Lista de vértices [[lon, lat], ...]

    Returns:
        Tabela formatada em texto
    """
    table = "TABELA DE COORDENADAS (SIRGAS 2000)\n"
    table += "=" * 60 + "\n"
    table += f"{'Vértice':<10} {'Longitude (E)':<20} {'Latitude (N)':<20}\n"
    table += "-" * 60 + "\n"

    for i, vertex in enumerate(vertices):
        lon, lat = vertex
        table += f"V{i+1:<9} {lon:>19.6f} {lat:>19.6f}\n"

    table += "=" * 60 + "\n"

    return table


def calculate_perimeter(vertices: List[List[float]]) -> float:
    """
    Calcula perímetro do polígono.

    Args:
        vertices: Lista de vértices [[lon, lat], ...]

    Returns:
        Perímetro em metros
    """
    if len(vertices) < 3:
        return 0.0

    # Garantir que o polígono está fechado
    if vertices[0] != vertices[-1]:
        vertices_closed = vertices + [vertices[0]]
    else:
        vertices_closed = vertices

    perimeter = 0.0
    for i in range(len(vertices_closed) - 1):
        p1 = (vertices_closed[i][0], vertices_closed[i][1])
        p2 = (vertices_closed[i + 1][0], vertices_closed[i + 1][1])
        perimeter += calculate_distance(p1, p2)

    return perimeter
