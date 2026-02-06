# Backend API Testing Guide

## Quick Start

### 1. Setup Environment

```bash
cd apps/api

# Create virtual environment (if not exists)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your database configuration
nano .env  # or code .env
```

### 2. Database Initialization

```bash
# Run Alembic migrations (creates all tables)
alembic upgrade head

# Verify tables created
psql postgresql://user:password@localhost/bemreal -c "\dt"
```

### 3. Start API Server

```bash
# Development mode with hot reload
python -m uvicorn main_new:app --reload --host 0.0.0.0 --port 8000

# Production mode (without reload)
python -m uvicorn main_new:app --host 0.0.0.0 --port 8000 --workers 4
```

Visit: **<http://localhost:8000/docs>** (Swagger UI)

---

## Test Scenarios

### Scenario 1: User Registration & Authentication

#### Step 1: Check Health

```bash
curl http://localhost:8000/health | jq
```

Expected:

```json
{
  "status": "ok",
  "timestamp": "2024-12-20T...",
  "version": "1.0.0"
}
```

#### Step 2: First-Time Login (Auto-Create PROPRIETARIO)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "test123"
  }' | jq
```

Expected:

```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer",
  "expires_at": "2024-12-20T...",
  "user": {
    "id": "uuid",
    "email": "client@example.com",
    "role": "PROPRIETARIO"
  }
}
```

**Save token for next requests:**

```bash
TOKEN="eyJ0eXAi..."
```

---

### Scenario 2: Project Management

#### Step 1: Create Project (TOPOGRAFO only)

First, login as topografo:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "topografo@survey.com",
    "password": "secret"
  }' | jq -r '.access_token' > /tmp/topografo_token.txt

TOPO_TOKEN=$(cat /tmp/topografo_token.txt)
```

Create project:

```bash
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer $TOPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loteamento Vila Colonial",
    "description": "Desmembramento em São Paulo"
  }' | jq
```

Expected:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Loteamento Vila Colonial",
  "description": "Desmembramento em São Paulo",
  "status": "DRAFT",
  "owner_topografo_id": "...",
  "created_at": "2024-12-20T...",
  "parcels_count": 0
}
```

**Save project ID:**

```bash
PROJECT_ID="550e8400-e29b-41d4-a716-446655440000"
```

#### Step 2: Create Invite Link for Client

```bash
curl -X POST http://localhost:8000/auth/invite/$PROJECT_ID \
  -H "Authorization: Bearer $TOPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_email": "client@example.com"}' | jq
```

Expected:

```json
{
  "invite_token": "eyJ0eXAi...",
  "expires_at": "2024-12-27T...",
  "client_email": "client@example.com"
}
```

**Client uses this token to login:**

```bash
CLIENT_TOKEN="eyJ0eXAi..."
curl -X GET http://localhost:8000/projects/$PROJECT_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq
```

#### Step 3: List Projects

```bash
# As topografo (sees all tenant projects)
curl -X GET http://localhost:8000/projects \
  -H "Authorization: Bearer $TOPO_TOKEN" | jq

# As client (sees only invited projects)
curl -X GET http://localhost:8000/projects \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq
```

---

### Scenario 3: Parcel Creation & Geometry Validation

#### Step 1: Create Parcel

```bash
curl -X POST http://localhost:8000/projects/$PROJECT_ID/parcels \
  -H "Authorization: Bearer $TOPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lote 01 - Rua Principal",
    "description": "Frente para Av. Paulista"
  }' | jq
```

Expected:

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "project_id": "$PROJECT_ID",
  "name": "Lote 01 - Rua Principal",
  "status": "PENDING",
  "created_at": "2024-12-20T..."
}
```

**Save parcel ID:**

```bash
PARCEL_ID="660e8400-e29b-41d4-a716-446655440111"
```

#### Step 2: Validate Geometry (Client Sketch)

Create a simple polygon (square ~1000m x 1000m in WGS84):

```bash
curl -X POST http://localhost:8000/geometry/validate \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "'$PROJECT_ID'",
    "parcel_id": "'$PARCEL_ID'",
    "geom_geojson": {
      "type": "Polygon",
      "coordinates": [[
        [-46.6500, -23.5505],
        [-46.6400, -23.5505],
        [-46.6400, -23.5405],
        [-46.6500, -23.5405],
        [-46.6500, -23.5505]
      ]]
    }
  }' | jq
```

Expected (OK - no overlaps):

```json
{
  "status": "OK",
  "can_proceed": true,
  "has_overlap_alert": false,
  "area_m2": 1234567.89,
  "perimeter_m": 4567.89,
  "warnings": [],
  "message": "OK"
}
```

#### Step 3: Test Overlap Warning

If SIGEF geometries exist in database, validate overlapping geometry:

```bash
curl -X POST http://localhost:8000/geometry/validate \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "'$PROJECT_ID'",
    "parcel_id": "'$PARCEL_ID'",
    "geom_geojson": {
      "type": "Polygon",
      "coordinates": [[
        [-46.6550, -23.5550],
        [-46.6450, -23.5550],
        [-46.6450, -23.5450],
        [-46.6550, -23.5450],
        [-46.6550, -23.5550]
      ]]
    }
  }' | jq
```

Expected (WARN - overlap detected):

```json
{
  "status": "WARN",
  "can_proceed": true,
  "has_overlap_alert": true,
  "area_m2": 1111111.11,
  "perimeter_m": 4200.0,
  "warnings": [
    {
      "type": "SIGEF_OVERLAP",
      "details": {
        "overlap_area_m2": 456789.0,
        "certified_owner": "INCRA"
      }
    }
  ],
  "message": "Validation passed with warnings"
}
```

#### Step 4: Test Invalid Geometry (Too Small)

```bash
curl -X POST http://localhost:8000/geometry/validate \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "'$PROJECT_ID'",
    "parcel_id": "'$PARCEL_ID'",
    "geom_geojson": {
      "type": "Polygon",
      "coordinates": [[
        [-46.6500, -23.5505],
        [-46.6499, -23.5505],
        [-46.6499, -23.5504],
        [-46.6500, -23.5504],
        [-46.6500, -23.5505]
      ]]
    }
  }' | jq
```

Expected (FAIL - area too small):

```json
{
  "status": "FAIL",
  "can_proceed": false,
  "code": "GEOM_INVALID",
  "message": "Area 10.23 m² is less than minimum 100 m²"
}
```

---

### Scenario 4: Client Intake Submission

```bash
curl -X POST http://localhost:8000/projects/$PROJECT_ID/parcels/$PARCEL_ID/intake \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "João Silva",
    "client_email": "joao@example.com",
    "client_phone": "+5511987654321",
    "location_description": "Área localizada na Rua Principal, próximo ao semáforo",
    "documents": [
      "link_to_matricula_pdf",
      "link_to_car_pdf"
    ],
    "confrontantes": [
      {
        "nome": "Maria Santos",
        "lado": "NORTE"
      },
      {
        "nome": "José Costa",
        "lado": "SUL"
      }
    ]
  }' | jq
```

Expected:

```json
{
  "id": "$PARCEL_ID",
  "project_id": "$PROJECT_ID",
  "name": "Lote 01",
  "client_name": "João Silva",
  "client_email": "joao@example.com",
  "client_phone": "+5511987654321",
  "status": "PENDING",
  "location_description": "Área localizada...",
  "documents": [...],
  "neighbors": [...]
}
```

---

## Troubleshooting

### Database Connection Error

```
Error: could not connect to database
```

**Solution**:

1. Check PostgreSQL is running: `psql --version`
2. Verify DATABASE_URL in .env: `postgresql://user:password@host:port/dbname`
3. Test connection: `psql postgresql://user:password@localhost/bemreal`

### PostGIS Extension Not Found

```
ERROR: function st_intersects(...) does not exist
```

**Solution**:

```sql
-- Enable PostGIS in database
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

-- Verify
SELECT postgis_version();
```

### JWT Token Expired

```json
{
  "detail": "Invalid or expired token"
}
```

**Solution**: Regenerate token (15 min expiration by default)

### Parcel Not Found

```json
{
  "status_code": 404,
  "detail": "Parcel not found"
}
```

**Solution**: Verify:

1. Parcel ID is correct (UUID format)
2. Parcel belongs to correct project
3. User has access to project (TOPOGRAFO: all tenant; PROPRIETARIO: invited only)

### Access Denied

```json
{
  "status_code": 403,
  "detail": "Access denied to parcel"
}
```

**Solution**:

- PROPRIETARIO users can only access parcels they're invited to
- PROPRIETARIO invite includes project_id in token
- Create invite link with `POST /auth/invite/{project_id}` first

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"topografo@survey.com","password":"secret"}' | jq -r '.access_token')

# Benchmark health endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:8000/health

# Benchmark list projects (with auth header)
ab -n 50 -c 5 -H "Authorization: Bearer $TOKEN" http://localhost:8000/projects
```

### Geometry Validation Performance

```bash
# Create 100 polygons and validate each
for i in {1..100}; do
  curl -s -X POST http://localhost:8000/geometry/validate \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{...}' > /dev/null
  echo "Validated $i"
done
```

---

## Integration Testing (Pytest)

Create `test_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from main_new import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login():
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_geometry_validation():
    # Get token
    auth_response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    token = auth_response.json()["access_token"]
    
    # Validate geometry
    response = client.post(
        "/geometry/validate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "project_id": "test-project",
            "parcel_id": "test-parcel",
            "geom_geojson": {
                "type": "Polygon",
                "coordinates": [[
                    [-46.65, -23.55],
                    [-46.64, -23.55],
                    [-46.64, -23.54],
                    [-46.65, -23.54],
                    [-46.65, -23.55]
                ]]
            }
        }
    )
    assert response.status_code == 200
    assert "status" in response.json()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

Run tests:

```bash
pytest test_api.py -v
```

---

## Logs & Debugging

### Enable SQL Query Logging

In `config.py`:

```python
SQL_ECHO = True  # See all SQL queries
```

### Enable Request Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### View Database State

```bash
# Connect to PostgreSQL
psql postgresql://user:password@localhost/bemreal

# Check users
SELECT id, email, role, created_at FROM app_user;

# Check projects
SELECT id, name, status, created_at FROM project ORDER BY created_at DESC;

# Check parcels
SELECT id, name, status, created_at FROM parcel ORDER BY created_at DESC;

# Check validation events
SELECT id, parcel_id, type, result, created_at FROM validation_event ORDER BY created_at DESC LIMIT 20;
```

---

## Next Steps

After successful testing:

1. **Implement Payment Endpoints** (`POST /payments`, webhook handlers)
2. **Implement Contract Endpoints** (`POST /contracts/{parcel_id}/sign`)
3. **Implement Document Upload** (`POST /documents/{parcel_id}/upload`)
4. **Build Frontend Client** (React wizard with map integration)
5. **Build Frontend Topógrafo** (Dashboard + CAD tools)
6. **Deploy to Production** (Docker + Kubernetes or VPS)
