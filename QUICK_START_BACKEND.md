# Backend Quick Start - 5 Minutes

## Prerequisites

```bash
# Check versions
python --version       # 3.11+
psql --version        # PostgreSQL 14+
node --version        # 20+ (for frontend later)
```

## Step 1: Setup Database (2 min)

```bash
# Create database
createdb bemreal

# Add PostGIS extension
psql bemreal -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;"

# Verify PostGIS is installed
psql bemreal -c "SELECT postgis_version();"
```

## Step 2: Setup Backend (2 min)

```bash
cd apps/api

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your DATABASE_URL
# Example: postgresql://user:password@localhost:5432/bemreal
nano .env  # or code .env
```

## Step 3: Run Migrations (1 min)

```bash
# Create database schema
alembic upgrade head

# Verify tables created
psql bemreal -c "\dt"
```

## Step 4: Start Server (<1 min)

```bash
# Development mode (hot reload)
python -m uvicorn main_new:app --reload --host 0.0.0.0 --port 8000

# Or production mode
python -m uvicorn main_new:app --host 0.0.0.0 --port 8000 --workers 4
```

## Step 5: Test API (1 min)

Open browser: **<http://localhost:8000/docs>**

Or test with curl:

```bash
# Health check
curl http://localhost:8000/health | jq

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq

# Save token from response
TOKEN="eyJ0eXAi..."

# Create project
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Project A","description":"Test"}' | jq
```

---

## Troubleshooting

### ❌ "could not connect to server"

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Create database if it doesn't exist
createdb bemreal
```

### ❌ "function st_buffer(...) does not exist"

```bash
# Enable PostGIS
psql bemreal -c "CREATE EXTENSION postgis;"
```

### ❌ "ModuleNotFoundError: No module named 'fastapi'"

```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ "401 Unauthorized" on protected endpoints

```bash
# Make sure you include the Authorization header
curl -X GET http://localhost:8000/projects \
  -H "Authorization: Bearer $TOKEN"
```

### ❌ Port 8000 already in use

```bash
# Use different port
python -m uvicorn main_new:app --reload --port 8001
```

---

## Next Steps

1. **Test Endpoints**: Follow [BACKEND_API_TESTING.md](./BACKEND_API_TESTING.md)
2. **Understand Architecture**: Read [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)
3. **Build Features**: Implement contract, payment, document endpoints
4. **Deploy**: Use [DEPLOY_BACKEND.md](./DEPLOY_BACKEND.md)

---

## File Structure (What You Just Set Up)

```
apps/api/
├── main_new.py              ← FastAPI app (15 endpoints)
├── config.py                ← Settings
├── database.py              ← DB session
├── models.py                ← SQLAlchemy ORM
├── schemas.py               ← Pydantic DTOs
└── services/
    ├── auth.py              ← JWT + password hashing
    └── geo.py               ← PostGIS validation
```

**Database**: PostgreSQL + PostGIS (14 tables)
**API**: RESTful with Swagger UI at /docs

---

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/logout` | Revoke session |
| `POST` | `/auth/invite/{project_id}` | Create invite link |
| `POST` | `/projects` | Create project |
| `GET` | `/projects` | List projects |
| `GET` | `/projects/{id}` | Get project details |
| `POST` | `/projects/{id}/parcels` | Create parcel |
| `GET` | `/projects/{id}/parcels/{id}` | Get parcel |
| `POST` | `/geometry/validate` | Validate geometry |
| `POST` | `/projects/{id}/parcels/{id}/intake` | Submit intake form |

**Full Docs**: <http://localhost:8000/docs>

---

## Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bemreal
SQL_ECHO=False

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_SECONDS=900

# Geospatial
AREA_MIN_M2=100
GAP_TOLERANCE_M2=1.0
SIGEF_OVERLAP_TOLERANCE_M2=0

# Environment
ENV=development
```

---

## Common Commands

```bash
# Start server
python -m uvicorn main_new:app --reload

# Run migrations
alembic upgrade head

# Check current migration
alembic current

# Create new migration
alembic revision --autogenerate -m "Add new table"

# Connect to database
psql postgresql://user:password@localhost/bemreal

# List tables
psql bemreal -c "\dt"

# Stop server
Ctrl+C
```

---

## Success Criteria ✅

When you see this in your terminal:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**You're ready to test!** Open <http://localhost:8000/docs> in your browser.

---

**🎉 Backend is running!**

Next: Follow [BACKEND_API_TESTING.md](./BACKEND_API_TESTING.md) to test endpoints.
