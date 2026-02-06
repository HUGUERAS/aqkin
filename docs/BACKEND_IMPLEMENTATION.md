# Bem Real Backend Implementation - Phase 2

## Implementation Status

### ✅ COMPLETED

#### 1. **Geospatial Validation Service** (`services/geo.py`)

Complete PostGIS-based geometry validation pipeline:

- **`clean_geometry()`**: Normalize geometries, validate with Shapely buffer(0), return cleaned GeoJSON
- **`validate_geometry_constraints()`**: Check minimum area (100 m²), minimum vertices (3)
- **`check_sigef_overlap()`**: PostGIS ST_Intersects query against certified INCRA geometries
- **`check_neighbor_overlap()`**: Detect overlaps with sibling parcels in same project
- **`check_gaps_in_project()`**: Compute symmetric difference for multi-parcel projects
- **`calculate_metrics()`**: Area (m²) and perimeter (m) from geometry
- **`validate_geometry_complete()`**: Full pipeline returning `GeometryResponse` with:
  - Status: `OK | WARN | FAIL`
  - `can_proceed`: boolean (alerts don't block)
  - `has_overlap_alert`: SIGEF/neighbor/gap flags
  - `area_m2`, `perimeter_m`
  - `warnings[]`: list of validation warnings with details

**Key Behavior**:

- SIGEF overlap → `WARN`, `can_proceed=true` (non-blocking alert)
- Neighbor overlap → `WARN`, alert flag set
- Missing area → `FAIL`, blocks save
- Invalid geometry → `FAIL`, blocks save

#### 2. **Database Session Management** (`database.py`)

Connection pooling and session factory:

- **`engine`**: SQLAlchemy engine with PostGIS support + connection pooling
- **`SessionLocal`**: Session factory for FastAPI dependency injection
- **`get_db()`**: Dependency function for SQLAlchemy session lifecycle
- **`init_db()`**: Initialize schema (dev only; prod uses Alembic migrations)
- **`close_db()`**: Shutdown hook for graceful engine disposal
- PostGIS auto-load on connection (if needed)

#### 3. **FastAPI Application** (`main_new.py`)

Modern REST API with JWT auth and geometry validation:

##### Endpoints Implemented

**Health & Root**:

- `GET /health` → Health check
- `GET /` → API info

**Authentication**:

- `POST /auth/login` → Authenticate user + return JWT
  - Input: `{ email, password }`
  - Output: `{ access_token, token_type, expires_at, user }`
  - Auto-creates PROPRIETARIO on first login (dev mode)
  - Scopes PROPRIETARIO tokens to project_id/parcel_id if provided
  
- `POST /auth/logout` → Revoke JWT (stub for now)
  
- `POST /auth/invite/{project_id}` → Create shareable invite link
  - Input: `{ client_email }`
  - Output: `{ invite_token, expires_at, client_email }`
  - JWT expires in 7 days
  - Stores JTI in `invite_link` table for revocation tracking

**Geometry**:

- `POST /geometry/validate` → Full validation pipeline
  - Input: `{ project_id, parcel_id, geom_geojson }`
  - Output: `GeometryResponse` with status, warnings, metrics
  - Checks: validity, area, SIGEF overlap, neighbors, gaps
  - PROPRIETARIO users scoped to own parcels

**Projects**:

- `POST /projects` → Create project (TOPOGRAFO only)
  - Input: `{ name, description }`
  - Output: `ProjectResponse`
  
- `GET /projects/{project_id}` → Get project details
  - Tenant-scoped access
  
- `GET /projects` → List all projects
  - Scoped by role (TOPOGRAFO → all tenant projects; PROPRIETARIO → invited only)

**Parcels**:

- `POST /projects/{project_id}/parcels` → Create parcel
  - Input: `{ name, description }`
  - Output: `ParcelResponse`
  
- `GET /projects/{project_id}/parcels/{parcel_id}` → Get parcel details

**Client Intake** (Wizard Step 1):

- `POST /projects/{project_id}/parcels/{parcel_id}/intake` → Submit client form
  - Input: `ClientIntakeRequest` (name, email, phone, location, documents, neighbors)
  - Output: `ParcelResponse`
  - Stores intake data on parcel for later processing

##### Dependencies & Middleware

- **CORS**: Configured for all origins (dev mode); should restrict in production
- **Error Handling**: Custom validation error handler returns detailed field errors
- **Auth Middleware**: `get_current_user()` validates JWT + checks token revocation
- **Role-Based Access**: `get_current_topografo()` enforces TOPOGRAFO role
- **Tenant Scoping**: All queries filtered by `tenant_id` automatically
- **Parcel Scoping**: PROPRIETARIO users can only access own parcels

##### Lifespan Management

- **Startup**: Initialize database, log startup message
- **Shutdown**: Dispose engine, close connections gracefully

#### 4. **Supporting Infrastructure**

- **config.py**: Centralized settings (DB, JWT, S3, payment, geo tolerances)
- **schemas.py**: Full Pydantic model coverage (enums, requests, responses)
- **models.py**: SQLAlchemy ORM with 14 tables + relationships + indexes
- **services/auth.py**: JWT utilities (hash, verify, create, revoke)
- **requirements.txt**: Updated with sqlalchemy, alembic, psycopg2, geoalchemy2, shapely

---

## 🔄 IN PROGRESS

1. **Integration Testing**:
   - Test auth pipeline (login, token validation, revocation)
   - Test geometry validation (SIGEF, neighbors, gaps)
   - Test RBAC enforcement

2. **Documentation**:
   - API OpenAPI schema (auto-generated by FastAPI)
   - Architecture diagrams (data flow, RBAC)
   - Deployment guide

---

## ⏳ NEXT STEPS (Priority Order)

### **Phase 3: Complete CRUD Routers** (Blocks Frontend)

1. Contract endpoints (create, list, sign, store evidence)
2. Payment endpoints (create intent, webhook listeners)
3. Milestone endpoints (create, update status, track progress)
4. Todo endpoints (create, assign, complete)
5. Document endpoints (upload to S3, list, delete)
6. Validation history endpoint (audit log)

### **Phase 4: Frontend - Client (React Wizard)**

1. Step 1: Intake form (name, contact, location, documents, neighbors)
2. Step 2: Sketch drawing (OpenLayers map, free-form polygon)
3. Step 3: Validate geometry (call `/geometry/validate`, show warnings)
4. Step 4: Review + sign (contract, payment terms, timeline)
5. Step 5: Success + tracking (view status, milestones, payments)

### **Phase 5: Frontend - Topógrafo (React Dashboard)**

1. Project list + filters
2. Parcel details + geometry viewer (OpenLayers with full official geometry)
3. CAD tools (edit official geometry, measure, validate)
4. Import/export (SHAPEFILE, GeoJSON to S3)
5. Payment dashboard (received, pending, refunded)
6. Timeline management (create milestones, track deliverables)

### **Phase 6: DevOps & Deployment**

1. Docker setup (FastAPI + gunicorn)
2. PostgreSQL migrations + PostGIS setup (production)
3. Environment configuration (dev/staging/prod)
4. CI/CD pipeline (GitHub Actions → Docker Registry → VPS/Cloud)
5. SSL/TLS + domain configuration

---

## Architecture Decision Log

### Geometry Validation Strategy

- **Decision**: Non-blocking alerts for SIGEF overlap + neighbor conflicts
- **Rationale**: Client should be aware of issues but can proceed with regularization
- **Implementation**: `can_proceed=true` even on `WARN` status
- **Alternative Considered**: Blocking FAIL for any overlap → too strict; clients may have legitimate overlaps in desmembramento scenarios

### Multi-Tenancy Scoping

- **Decision**: Per-topógrafo tenant (one tenant per topographer firm)
- **Rationale**: Simplifies RBAC, billing, and data isolation
- **Implementation**: All queries filtered by `tenant_id` automatically via Depends middleware
- **Future**: Could extend to allow shared tenants for firm networks

### JWT Token Scoping

- **Decision**: PROPRIETARIO tokens scoped to project_id + parcel_id; TOPOGRAFO tokens scoped to tenant_id
- **Rationale**: Fine-grained access control; share links included project/parcel context
- **Revocation**: Stored in `invite_link` table via JTI
- **Expiration**: 15 min standard; 7 days for invite links

### Geometry Storage

- **Decision**: Two columns per parcel: `geom_client_sketch` + `geom_official`
- **Rationale**: Separate workflows; client sketch for subsidy only, topógrafo refines official
- **Status Tracking**: `sketch_status` (pending/approved/rejected/request_revision) + `parcel_status`
- **PostGIS Type**: Geography (degrees) for validation; can transform to utm for CAD

---

## Database Schema Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `tenant` | Multi-tenancy root | id, name, email |
| `app_user` | Users (topografo/proprietario) | id, tenant_id, email, role, password_hash |
| `project` | Projects (topografo manages) | id, tenant_id, owner_topografo_id, name, status |
| `parcel` | Individual properties | id, project_id, geom_client_sketch, geom_official, sketch_status |
| `contract_template` | Versioned legal docs | id, project_id, version, body |
| `contract_acceptance` | Signed evidence | id, parcel_id, template_version, ip, timestamp |
| `payment_intent` | Stripe/PagSeguro | id, parcel_id, status, provider, provider_ref, amount |
| `payment_receipt` | Proof of payment | id, payment_intent_id, url, issued_at |
| `milestone` | Timeline steps | id, parcel_id, name, due_at, position |
| `milestone_status` | Parcel-milestone tracking | id, milestone_id, parcel_id, status, completed_at |
| `todo` | Tasks | id, parcel_id, description, assignee, due_at, completed_at |
| `sigef_certified` | INCRA geometries | id, owner, geom (GIST index) |
| `validation_event` | Audit log | id, parcel_id, type (enum), result, severity, details (JSON) |
| `invite_link` | JWT revocation + tracking | jti, email, project_id, expires_at, revoked_at |
| `document` | File storage (S3 refs) | id, parcel_id, type, url, hash, uploader, created_at |

---

## Development Workflow

### 1. Run Backend Locally

```bash
cd apps/api

# Install deps
pip install -r requirements.txt

# Set environment
export $(cat .env | xargs)

# Run migrations (if needed)
alembic upgrade head

# Start server
python -m uvicorn main_new:app --loader-reload --host 0.0.0.0 --port 8000
```

### 2. Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"topografo@example.com","password":"secret"}'

# Create project
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Project A","description":"Test"}'

# Validate geometry
curl -X POST http://localhost:8000/geometry/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id":"uuid",
    "parcel_id":"uuid",
    "geom_geojson":{...}
  }'
```

### 3. OpenAPI Docs

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Schema: `http://localhost:8000/openapi.json`

---

## Debugging Tips

### PostgreSQL Queries

```python
# In Python console
from database import SessionLocal
from models import Parcel
db = SessionLocal()
parcel = db.query(Parcel).first()
print(parcel.geom_client_sketch)  # WKT
```

### JWT Token Inspection

```bash
# Decode token online at jwt.io or use:
curl -s "jwt-token" | base64 -d | jq .
```

### PostGIS Geometry Issues

```sql
-- Check PostGIS is enabled
SELECT postgis_version();

-- Validate geometry
SELECT ST_IsValid(geom) FROM parcel_;

-- Fix invalid geometry
UPDATE parcel SET geom_official = ST_Buffer(geom_official, 0) WHERE NOT ST_IsValid(geom_official);
```

---

## Configuration Reference

See [config.py](./config.py) for full list. Key settings:

```python
# Database
DATABASE_URL = "postgresql://user:pass@localhost/bemreal"
SQL_ECHO = False

# JWT
JWT_SECRET = "your-secret-key"
JWT_EXPIRATION_SECONDS = 900  # 15 min

# Geo
AREA_MIN_M2 = 100
GAP_TOLERANCE_M2 = 1
SIGEF_OVERLAP_TOLERANCE_M2 = 0  # Any overlap alerts

# S3 (for documents)
S3_BUCKET = "bemreal-docs"
S3_REGION = "us-east-1"
S3_ACCESS_KEY_ID = "..."
S3_SECRET_ACCESS_KEY = "..."

# Payments
STRIPE_SECRET_KEY = "sk_..."
PAGSEGURO_TOKEN = "..."
```

---

## Notes for Next Developer

1. **main.py vs main_new.py**: `main_new.py` is the refactored version; `main.py` is legacy. Once main_new.py is tested, replace main.py and delete main_new.py.

2. **CORS Configuration**: Currently allows all origins (`["*"]`). Restrict to frontend URL in production.

3. **Token Revocation**: Currently checks `invite_link.revoked_at` for JTI. Could be moved to Redis cache for performance at scale.

4. **Geo Metrics**: Using rough lat/lon approximation (111319.5 m per degree). For production, use PostGIS `ST_Area(geog)` to get exact values.

5. **Async**: Currently using synchronous SQLAlchemy. Could switch to async-sqlalchemy + asyncpg for better concurrency.

6. **S3 Upload**: Document upload endpoint not yet implemented. Will need boto3 + presigned URLs.

7. **Payment Webhooks**: Stripe/PagSeguro webhook handlers not yet implemented. Will need to validate signatures + update payment status.

8. **Frontend**: Client-side JWT refresh logic not yet designed. Consider short expiration (15 min) + refresh token pattern.
