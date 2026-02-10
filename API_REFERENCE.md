# 🔌 API Quick Reference - AtivoReal

## Base URLs

```
Development: http://localhost:8000
Production:  https://seu-backend.railway.app (ou outro)
Docs:        http://localhost:8000/docs
ReDoc:       http://localhost:8000/redoc
OpenAPI:     http://localhost:8000/openapi.json
```

## Authentication

Todos os endpoints (exceto `/health` e `/auth/login`) requerem autenticação JWT.

**Header necessário:**
```
Authorization: Bearer <seu_jwt_token>
```

## 🔐 Autenticação

### POST /auth/login
Login de usuário (retorna JWT)

**Request:**
```json
{
  "email": "topografo@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_at": "2026-02-10T12:00:00Z",
  "user": {
    "id": "uuid",
    "email": "topografo@example.com",
    "role": "TOPOGRAFO",
    "tenant_id": "uuid"
  }
}
```

### POST /auth/logout
Logout (revoga token)

**Request:** (apenas header Authorization)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/invite/{project_id}
Criar link de convite para cliente

**Request:**
```json
{
  "client_email": "cliente@example.com"
}
```

**Response (201):**
```json
{
  "invite_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2026-02-17T12:00:00Z",
  "client_email": "cliente@example.com"
}
```

## 📁 Projetos

### GET /projects
Listar todos os projetos

**Query Params:**
- `skip` (int, default=0): Offset para paginação
- `limit` (int, default=100): Limite de resultados

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "Projeto A",
    "description": "Descrição",
    "status": "ACTIVE",
    "created_at": "2026-02-10T10:00:00Z"
  }
]
```

### POST /projects
Criar novo projeto (apenas TOPOGRAFO)

**Request:**
```json
{
  "name": "Projeto Novo",
  "description": "Descrição do projeto"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "name": "Projeto Novo",
  "description": "Descrição do projeto",
  "status": "ACTIVE",
  "created_at": "2026-02-10T10:00:00Z"
}
```

### GET /projects/{project_id}
Obter detalhes de um projeto

**Response (200):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "name": "Projeto A",
  "description": "Descrição",
  "status": "ACTIVE",
  "created_at": "2026-02-10T10:00:00Z",
  "parcels": []
}
```

### PUT /projects/{project_id}
Atualizar projeto

**Request:**
```json
{
  "name": "Projeto Atualizado",
  "description": "Nova descrição",
  "status": "COMPLETED"
}
```

**Response (200):** Mesmo formato do GET

### DELETE /projects/{project_id}
Deletar projeto

**Response (204):** No content

## 📍 Parcelas (Lotes)

### GET /projects/{project_id}/parcels
Listar parcelas de um projeto

**Response (200):**
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "Lote 1",
    "description": "Descrição",
    "area_m2": 1500.50,
    "perimeter_m": 200.0,
    "sketch_status": "PENDING",
    "parcel_status": "ACTIVE",
    "created_at": "2026-02-10T10:00:00Z"
  }
]
```

### POST /projects/{project_id}/parcels
Criar nova parcela

**Request:**
```json
{
  "name": "Lote 2",
  "description": "Descrição do lote"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Lote 2",
  "description": "Descrição do lote",
  "area_m2": null,
  "perimeter_m": null,
  "sketch_status": "PENDING",
  "parcel_status": "ACTIVE",
  "created_at": "2026-02-10T10:00:00Z"
}
```

### GET /projects/{project_id}/parcels/{parcel_id}
Obter detalhes de uma parcela

**Response (200):** Mesmo formato acima + geometrias

### PUT /projects/{project_id}/parcels/{parcel_id}
Atualizar parcela

**Request:**
```json
{
  "name": "Lote 2 Atualizado",
  "description": "Nova descrição",
  "parcel_status": "VALIDATED"
}
```

**Response (200):** Mesmo formato do GET

### DELETE /projects/{project_id}/parcels/{parcel_id}
Deletar parcela

**Response (204):** No content

## 🗺️ Validação de Geometria

### POST /geometry/validate
Validar geometria completa (área, sobreposição SIGEF, vizinhos)

**Request:**
```json
{
  "project_id": "uuid",
  "parcel_id": "uuid",
  "geom_geojson": {
    "type": "Polygon",
    "coordinates": [
      [
        [-47.9292, -15.7801],
        [-47.9292, -15.7802],
        [-47.9291, -15.7802],
        [-47.9291, -15.7801],
        [-47.9292, -15.7801]
      ]
    ]
  }
}
```

**Response (200):**
```json
{
  "status": "OK",  // ou "WARN" ou "FAIL"
  "can_proceed": true,
  "has_overlap_alert": false,
  "area_m2": 1234.56,
  "perimeter_m": 140.0,
  "warnings": []
}
```

**Response com avisos (200):**
```json
{
  "status": "WARN",
  "can_proceed": true,
  "has_overlap_alert": true,
  "area_m2": 1234.56,
  "perimeter_m": 140.0,
  "warnings": [
    {
      "type": "SIGEF_OVERLAP",
      "message": "Sobreposição detectada com certificação SIGEF",
      "details": {
        "sigef_id": 123,
        "overlap_area_m2": 50.0
      }
    }
  ]
}
```

**Response com erro (200):**
```json
{
  "status": "FAIL",
  "can_proceed": false,
  "has_overlap_alert": false,
  "area_m2": null,
  "perimeter_m": null,
  "warnings": [
    {
      "type": "INVALID_GEOMETRY",
      "message": "Geometria inválida",
      "details": {}
    }
  ]
}
```

## 📥 Import

### POST /import/kml
Upload de arquivo KML

**Request:** `multipart/form-data`
```
file: <arquivo.kml>
project_id: uuid
```

**Response (201):**
```json
{
  "message": "KML imported successfully",
  "parcels_created": 3,
  "parcels": [
    {
      "id": "uuid",
      "name": "Imported Parcel 1",
      "area_m2": 1234.56
    }
  ]
}
```

### POST /import/shapefile
Upload de Shapefile (ZIP)

**Request:** `multipart/form-data`
```
file: <arquivo.zip>
project_id: uuid
```

**Response (201):**
```json
{
  "message": "Shapefile imported successfully",
  "parcels_created": 5,
  "parcels": [...]
}
```

### POST /import/geojson
Upload de GeoJSON

**Request:** `multipart/form-data`
```
file: <arquivo.geojson>
project_id: uuid
```

**Response (201):**
```json
{
  "message": "GeoJSON imported successfully",
  "parcels_created": 2,
  "parcels": [...]
}
```

## 📤 Export

### GET /export/kml/{project_id}
Download KML do projeto

**Response (200):** Arquivo KML
```
Content-Type: application/vnd.google-earth.kml+xml
Content-Disposition: attachment; filename="project_uuid.kml"
```

### GET /export/shapefile/{project_id}
Download Shapefile (ZIP)

**Response (200):** Arquivo ZIP
```
Content-Type: application/zip
Content-Disposition: attachment; filename="project_uuid.zip"
```

### GET /export/geojson/{project_id}
Download GeoJSON

**Response (200):** Arquivo GeoJSON
```
Content-Type: application/geo+json
Content-Disposition: attachment; filename="project_uuid.geojson"
```

## 🤖 AI Chat

### POST /ai/chat
Conversar com assistente IA (Claude)

**Request:**
```json
{
  "message": "Como funciona a validação de geometria?",
  "context": {
    "project_id": "uuid",
    "parcel_id": "uuid"
  }
}
```

**Response (200):**
```json
{
  "response": "A validação de geometria verifica...",
  "timestamp": "2026-02-10T10:00:00Z"
}
```

## 📋 SIGEF

### POST /sigef/validate
Validar área contra banco SIGEF

**Request:**
```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

**Response (200):**
```json
{
  "has_overlap": true,
  "overlaps": [
    {
      "sigef_id": 123,
      "codigo_imovel": "BR1234567",
      "owner": "João Silva",
      "overlap_area_m2": 50.0,
      "overlap_percentage": 4.5
    }
  ]
}
```

### GET /sigef/search
Buscar certificações SIGEF

**Query Params:**
- `bbox` (string): Bounding box "minLon,minLat,maxLon,maxLat"
- `codigo_imovel` (string): Código do imóvel

**Response (200):**
```json
[
  {
    "id": 123,
    "codigo_imovel": "BR1234567",
    "owner": "João Silva",
    "area_ha": 150.0,
    "certification_date": "2025-01-15"
  }
]
```

### POST /sigef/memorial
Gerar memorial descritivo

**Request:**
```json
{
  "parcel_id": "uuid"
}
```

**Response (200):**
```json
{
  "memorial": "MEMORIAL DESCRITIVO\n\n...",
  "vertices": [
    {"vertex": 1, "lat": -15.7801, "lon": -47.9292},
    {"vertex": 2, "lat": -15.7802, "lon": -47.9292}
  ]
}
```

## ❤️ Health Check

### GET /health
Verificar status da API

**Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-10T10:00:00Z"
}
```

### GET /
Informações da API

**Response (200):**
```json
{
  "name": "AtivoReal API",
  "version": "1.0.0",
  "status": "online"
}
```

## 🚨 Códigos de Erro

| Código | Significado |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sucesso sem conteúdo |
| 400 | Bad Request (dados inválidos) |
| 401 | Unauthorized (não autenticado) |
| 403 | Forbidden (sem permissão) |
| 404 | Not Found (recurso não encontrado) |
| 409 | Conflict (conflito de dados) |
| 422 | Unprocessable Entity (validação falhou) |
| 500 | Internal Server Error |

## 📝 Exemplo de Uso Completo

```bash
# 1. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"topografo@example.com","password":"senha123"}'

# Salvar token
TOKEN="eyJhbGci..."

# 2. Criar projeto
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Projeto Teste","description":"Teste"}'

# Salvar project_id
PROJECT_ID="uuid-do-projeto"

# 3. Criar parcela
curl -X POST http://localhost:8000/projects/$PROJECT_ID/parcels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lote 1","description":"Teste"}'

# Salvar parcel_id
PARCEL_ID="uuid-da-parcela"

# 4. Validar geometria
curl -X POST http://localhost:8000/geometry/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id":"'"$PROJECT_ID"'",
    "parcel_id":"'"$PARCEL_ID"'",
    "geom_geojson":{
      "type":"Polygon",
      "coordinates":[[
        [-47.9292,-15.7801],
        [-47.9292,-15.7802],
        [-47.9291,-15.7802],
        [-47.9291,-15.7801],
        [-47.9292,-15.7801]
      ]]
    }
  }'
```

## 🔗 Links Úteis

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Documentação Completa**: [REFERENCES.md](./REFERENCES.md)
- **Guia Rápido**: [GUIA_RAPIDO.md](./GUIA_RAPIDO.md)

---

**Última atualização**: 2026-02-10  
**Versão**: 1.0
