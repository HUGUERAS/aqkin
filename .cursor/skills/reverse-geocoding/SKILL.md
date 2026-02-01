---
name: reverse-geocoding
description: Converte coordenadas GPS (latitude/longitude) em endereços, nomes de propriedades, lotes e quadras. Use quando precisar identificar localização de pontos no mapa, gerar descrições de localização para clientes, ou enriquecer dados de geometrias com informações de endereço no projeto Ativo Real.
---

# Ferramenta de Geocodificação Reversa

## Visão Geral

A Geocodificação Reversa transforma coordenadas GPS em informações legíveis:

- Endereço completo (rua, número, bairro, cidade)
- Nome de propriedade (Fazenda X, Chácara Y)
- Identificação de lote/quadra
- Referências geográficas (próximo a X, distante Y km de Z)

## APIs Disponíveis

### 1. Nominatim (OpenStreetMap) - Gratuita

**Limite**: 1 requisição/segundo (sem API key)

```python
import requests
from typing import Dict, Optional

def geocodificar_reversa_nominatim(
    lat: float,
    lon: float
) -> Dict:
    """
    Geocodificação reversa usando Nominatim (OpenStreetMap).
    Retorna endereço completo e informações da localização.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        'lat': lat,
        'lon': lon,
        'format': 'json',
        'addressdetails': 1,
        'zoom': 18  # Máximo detalhe
    }
    headers = {
        'User-Agent': 'AtivoReal/1.0'  # Obrigatório
    }
    
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    
    if 'address' not in data:
        return {'erro': 'Endereço não encontrado'}
    
    address = data['address']
    
    return {
        'endereco_completo': data.get('display_name', ''),
        'rua': address.get('road', ''),
        'numero': address.get('house_number', ''),
        'bairro': address.get('suburb') or address.get('neighbourhood', ''),
        'cidade': address.get('city') or address.get('town', ''),
        'estado': address.get('state', ''),
        'cep': address.get('postcode', ''),
        'pais': address.get('country', ''),
        'tipo_local': data.get('type', ''),
        'nome_local': data.get('name', '')
    }
```

### 2. Google Geocoding API - Paga (mais precisa)

```python
import requests
from typing import Dict

def geocodificar_reversa_google(
    lat: float,
    lon: float,
    api_key: str
) -> Dict:
    """
    Geocodificação reversa usando Google Geocoding API.
    Mais precisa, mas requer API key paga.
    """
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'latlng': f"{lat},{lon}",
        'key': api_key,
        'language': 'pt-BR',
        'region': 'br'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['status'] != 'OK' or not data['results']:
        return {'erro': 'Endereço não encontrado'}
    
    result = data['results'][0]
    address_components = result['address_components']
    
    # Extrair componentes do endereço
    components = {}
    for comp in address_components:
        for type_name in comp['types']:
            components[type_name] = comp['long_name']
    
    return {
        'endereco_completo': result['formatted_address'],
        'rua': components.get('route', ''),
        'numero': components.get('street_number', ''),
        'bairro': components.get('sublocality') or components.get('neighborhood', ''),
        'cidade': components.get('locality') or components.get('administrative_area_level_2', ''),
        'estado': components.get('administrative_area_level_1', ''),
        'cep': components.get('postal_code', ''),
        'pais': components.get('country', ''),
        'tipo_local': result.get('types', [])[0] if result.get('types') else ''
    }
```

### 3. ViaCEP (Brasil) - Para identificar região

```python
def identificar_regiao_brasil(lat: float, lon: float) -> Dict:
    """
    Identifica região brasileira baseado em coordenadas.
    Útil para determinar qual cartório/prefeitura aplicar.
    """
    # Primeiro obter endereço via Nominatim
    endereco = geocodificar_reversa_nominatim(lat, lon)
    
    if 'cep' in endereco and endereco['cep']:
        # Buscar informações do CEP
        cep = endereco['cep'].replace('-', '')
        viacep_url = f"https://viacep.com.br/ws/{cep}/json/"
        response = requests.get(viacep_url)
        
        if response.status_code == 200:
            cep_data = response.json()
            if 'erro' not in cep_data:
                return {
                    **endereco,
                    'regiao': cep_data.get('uf', ''),
                    'municipio': cep_data.get('localidade', ''),
                    'bairro_cep': cep_data.get('bairro', '')
                }
    
    return endereco
```

## Integração com PostGIS

### Identificar Propriedade pelo Centroide

```sql
-- Obter coordenadas do centroide de um lote
SELECT 
  id,
  nome_cliente,
  ST_X(ST_Centroid(geom)) AS longitude,
  ST_Y(ST_Centroid(geom)) AS latitude
FROM lotes
WHERE id = :lote_id;
```

### Enriquecer Lote com Endereço

```python
def enriquecer_lote_com_endereco(
    supabase: Client,
    lote_id: int
) -> Dict:
    """
    Busca coordenadas do lote e enriquece com endereço.
    """
    # Buscar centroide
    query = f"""
    SELECT 
      id,
      ST_X(ST_Centroid(geom)) AS lon,
      ST_Y(ST_Centroid(geom)) AS lat
    FROM lotes
    WHERE id = {lote_id}
    """
    
    result = supabase.rpc('exec_sql', {'query': query}).execute()
    
    if not result.data:
        return {'erro': 'Lote não encontrado'}
    
    lote = result.data[0]
    lat, lon = lote['lat'], lote['lon']
    
    # Geocodificar reversa
    endereco = geocodificar_reversa_nominatim(lat, lon)
    
    # Atualizar lote com endereço (se houver campo para isso)
    # ou retornar para exibição
    
    return {
        'lote_id': lote_id,
        'coordenadas': {'lat': lat, 'lon': lon},
        'endereco': endereco
    }
```

## Frontend Integration

### React Hook para Geocodificação

```typescript
import { useState, useEffect } from 'react';

interface Endereco {
  endereco_completo: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

function useGeocodificacaoReversa(lat: number, lon: number) {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  useEffect(() => {
    if (!lat || !lon) return;
    
    setCarregando(true);
    setErro(null);
    
    fetch(`/api/geocodificar-reversa?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (data.erro) {
          setErro(data.erro);
        } else {
          setEndereco(data);
        }
      })
      .catch(err => setErro(err.message))
      .finally(() => setCarregando(false));
  }, [lat, lon]);
  
  return { endereco, carregando, erro };
}
```

### Componente de Exibição

```typescript
function LocalizacaoInfo({ lat, lon }: { lat: number; lon: number }) {
  const { endereco, carregando, erro } = useGeocodificacaoReversa(lat, lon);
  
  if (carregando) {
    return <div>📍 Identificando localização...</div>;
  }
  
  if (erro) {
    return <div>⚠️ Não foi possível identificar a localização</div>;
  }
  
  if (!endereco) {
    return null;
  }
  
  return (
    <div style={{
      padding: '1rem',
      background: '#f5f5f5',
      borderRadius: '8px',
      marginTop: '1rem'
    }}>
      <h3>📍 Localização Identificada</h3>
      <p><strong>Endereço:</strong> {endereco.endereco_completo}</p>
      {endereco.rua && (
        <p><strong>Rua:</strong> {endereco.rua} {endereco.numero}</p>
      )}
      <p><strong>Bairro:</strong> {endereco.bairro}</p>
      <p><strong>Cidade:</strong> {endereco.cidade} - {endereco.estado}</p>
      {endereco.cep && <p><strong>CEP:</strong> {endereco.cep}</p>}
    </div>
  );
}
```

## Endpoint API

### FastAPI Route

```python
@app.get("/api/geocodificar-reversa")
def geocodificar_reversa_endpoint(
    lat: float,
    lon: float
):
    """
    Geocodificação reversa: converte coordenadas em endereço.
    """
    try:
        resultado = geocodificar_reversa_nominatim(lat, lon)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lotes/{lote_id}/identificar-localizacao")
def identificar_localizacao_lote(lote_id: int):
    """
    Identifica e retorna endereço do centroide de um lote.
    """
    try:
        resultado = enriquecer_lote_com_endereco(supabase, lote_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Casos de Uso

### 1. Cliente Clica no Mapa

```typescript
// Quando cliente clica no mapa para desenhar
function handleMapClick(event: MapBrowserEvent) {
  const [lon, lat] = toLonLat(event.coordinate);
  
  // Mostrar endereço identificado
  const { endereco } = useGeocodificacaoReversa(lat, lon);
  
  // Exibir: "Você está na Fazenda X, Lote Y"
  mostrarMensagem(`📍 ${endereco?.endereco_completo || 'Localização identificada'}`);
}
```

### 2. Gerar Descrição de Localização

```python
def gerar_descricao_localizacao(lote_id: int) -> str:
    """
    Gera descrição textual da localização para documentos.
    """
    info = enriquecer_lote_com_endereco(supabase, lote_id)
    endereco = info['endereco']
    
    descricao = f"""
    Localizado em {endereco['bairro']}, 
    {endereco['cidade']} - {endereco['estado']}.
    Endereço: {endereco['rua']} {endereco['numero']}.
    CEP: {endereco['cep']}.
    """
    
    return descricao.strip()
```

### 3. Identificar Propriedade Rural

```python
def identificar_propriedade_rural(lat: float, lon: float) -> Dict:
    """
    Identifica se é propriedade rural e tenta obter nome.
    """
    endereco = geocodificar_reversa_nominatim(lat, lon)
    
    # Verificar se é área rural
    tipos_rurais = ['farm', 'farmland', 'rural', 'fazenda', 'chácara']
    tipo_local = endereco.get('tipo_local', '').lower()
    
    if any(tipo in tipo_local for tipo in tipos_rurais):
        return {
            **endereco,
            'tipo': 'RURAL',
            'nome_propriedade': endereco.get('nome_local', 'Propriedade Rural')
        }
    
    return {**endereco, 'tipo': 'URBANO'}
```

## Rate Limiting

### Implementar Cache

```python
from functools import lru_cache
from datetime import datetime, timedelta

cache_geocodificacao = {}

def geocodificar_com_cache(lat: float, lon: float) -> Dict:
    """
    Geocodificação com cache de 1 hora.
    """
    # Arredondar coordenadas para cache (precisão de ~100m)
    lat_rounded = round(lat, 3)
    lon_rounded = round(lon, 3)
    cache_key = f"{lat_rounded},{lon_rounded}"
    
    # Verificar cache
    if cache_key in cache_geocodificacao:
        cached_data, timestamp = cache_geocodificacao[cache_key]
        if datetime.now() - timestamp < timedelta(hours=1):
            return cached_data
    
    # Buscar novo
    resultado = geocodificar_reversa_nominatim(lat, lon)
    cache_geocodificacao[cache_key] = (resultado, datetime.now())
    
    return resultado
```

## Mensagens para o Usuário

- **Sucesso**: "📍 Você está na Fazenda Santa Maria, Lote 15"
- **Carregando**: "📍 Identificando localização..."
- **Erro**: "⚠️ Não foi possível identificar o endereço. Continue desenhando normalmente."

## Notas Importantes

1. **Rate Limiting**: Nominatim permite 1 req/segundo. Implementar cache e debounce
2. **Precisão**: Coordenadas arredondadas podem ser usadas para cache sem perder qualidade
3. **Fallback**: Se API falhar, permitir que usuário continue sem endereço
4. **Privacidade**: Não armazenar endereços completos sem consentimento do cliente
