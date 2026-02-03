---
applies_to:
  - "apps/api/**/*.py"
---

# Backend Instructions for Python FastAPI Application

## Technology Stack

- **FastAPI 0.109.0** - Modern async web framework
- **Python 3.x** - Primary language
- **SQLAlchemy 2.0.25** - ORM for database operations
- **GeoAlchemy2 0.14.3** - Spatial database support
- **Shapely 2.0.2** - Geometric operations
- **Pydantic 2.5.3** - Data validation
- **Supabase Python client 2.3.4** - Database client
- **Uvicorn** - ASGI server
- **python-jose** - JWT authentication

## FastAPI Best Practices

### Application Structure
```
apps/api/
├── main.py              # Application entry point
├── routers/             # API route handlers
│   ├── __init__.py
│   ├── projetos.py
│   └── lotes.py
├── models/              # SQLAlchemy models
│   ├── __init__.py
│   ├── projeto.py
│   └── lote.py
├── schemas/             # Pydantic schemas
│   ├── __init__.py
│   ├── projeto.py
│   └── lote.py
├── services/            # Business logic
├── utils/               # Helper functions
└── config.py            # Configuration
```

### API Endpoints

```python
# ✅ Good: Properly typed endpoints with Pydantic
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
) -> ProjectResponse:
    """Create a new project."""
    try:
        db_project = Project(**project.model_dump())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[ProjectResponse]:
    """List all projects with pagination."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects
```

### Error Handling

```python
# ✅ Good: Consistent error handling
from fastapi import HTTPException, status

class ProjectNotFoundError(Exception):
    pass

def get_project_or_404(db: Session, project_id: int) -> Project:
    """Get project by ID or raise 404."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return project

# ❌ Bad: Generic exceptions
def get_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise Exception("Not found")  # Too generic
    return project
```

## Pydantic Models (Schemas)

### Schema Design
```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

# ✅ Good: Comprehensive Pydantic models
class ProjectBase(BaseModel):
    """Base project schema with common fields."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ProjectCreate(ProjectBase):
    """Schema for creating a project."""
    pass

class ProjectUpdate(BaseModel):
    """Schema for updating a project (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    """Schema for project response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # SQLAlchemy 2.0 style

# ✅ Custom validation
class CoordinateSchema(BaseModel):
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    
    @validator('longitude', 'latitude')
    def validate_precision(cls, v):
        # Limit to 8 decimal places for reasonable precision
        return round(v, 8)
```

## SQLAlchemy Models

### ORM Models
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
from datetime import datetime

class Base(DeclarativeBase):
    pass

# ✅ Good: Well-defined models with relationships
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    lotes = relationship("Lote", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"
```

## Geospatial with PostGIS

### GeoAlchemy2 Models
```python
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import Point, Polygon, mapping
from sqlalchemy import Column, Integer, String

# ✅ Good: PostGIS geometry columns
class Lote(Base):
    __tablename__ = "lotes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    
    # Store as EPSG:4326 (WGS 84)
    geometry = Column(
        Geometry(geometry_type='POLYGON', srid=4326),
        nullable=False
    )
    
    centroid = Column(
        Geometry(geometry_type='POINT', srid=4326),
        nullable=True
    )
    
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="lotes")

# ✅ Working with geometries
def create_lote_with_geometry(db: Session, coordinates: list[list[float]]) -> Lote:
    """Create a lote with polygon geometry."""
    # Create Shapely polygon from coordinates
    polygon = Polygon(coordinates)
    
    # Validate geometry
    if not polygon.is_valid:
        raise ValueError("Invalid polygon geometry")
    
    # Create lote with WKT
    lote = Lote(
        name="New Lote",
        geometry=f"SRID=4326;{polygon.wkt}"
    )
    
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return lote

# ✅ Querying with spatial functions
from geoalchemy2.functions import ST_Area, ST_Distance, ST_Within

def find_lotes_within_distance(
    db: Session,
    point: Point,
    distance_meters: float
) -> List[Lote]:
    """Find all lotes within distance of a point."""
    # Convert point to WKT
    point_wkt = f"SRID=4326;{point.wkt}"
    
    # Query with spatial function
    # Note: ST_Distance in EPSG:4326 returns degrees, not meters
    # For accurate distance, transform to appropriate projected CRS
    lotes = db.query(Lote).filter(
        ST_Distance(Lote.centroid, point_wkt) < distance_meters / 111000  # Rough conversion
    ).all()
    
    return lotes
```

### Coordinate Handling
```python
# ✅ Good: Proper coordinate validation and conversion
from shapely.geometry import Point, Polygon

def validate_coordinates(lon: float, lat: float) -> tuple[float, float]:
    """Validate and normalize coordinates."""
    if not (-180 <= lon <= 180):
        raise ValueError(f"Invalid longitude: {lon}")
    if not (-90 <= lat <= 90):
        raise ValueError(f"Invalid latitude: {lat}")
    
    # Round to 8 decimal places (~1mm precision)
    return (round(lon, 8), round(lat, 8))

def geometry_to_geojson(geometry) -> dict:
    """Convert SQLAlchemy geometry to GeoJSON."""
    if geometry is None:
        return None
    
    shape = to_shape(geometry)
    return mapping(shape)

def geojson_to_geometry(geojson: dict) -> str:
    """Convert GeoJSON to WKT for database storage."""
    from shapely.geometry import shape
    
    geom = shape(geojson)
    if not geom.is_valid:
        raise ValueError("Invalid geometry")
    
    return f"SRID=4326;{geom.wkt}"
```

## Authentication & Security

### JWT Authentication
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validate JWT and return current user."""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return {"user_id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### Input Validation
```python
# ✅ Good: Sanitize and validate all inputs
from pydantic import validator, Field

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    
    @validator('name')
    def sanitize_name(cls, v):
        # Remove leading/trailing whitespace
        v = v.strip()
        # Prevent SQL injection (Pydantic + SQLAlchemy handles this)
        if not v:
            raise ValueError("Name cannot be empty")
        return v
```

## Database Sessions

### Dependency Injection
```python
from sqlalchemy.orm import Session
from contextlib import contextmanager

# ✅ Good: Proper session management with dependency injection
def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Use in endpoints
@router.get("/projects/{id}")
async def get_project(
    id: int,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
```

## Async Operations

```python
# ✅ Good: Use async for I/O operations
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select

async def get_projects_async(db: AsyncSession) -> List[Project]:
    """Async database query."""
    result = await db.execute(select(Project))
    return result.scalars().all()

# ⚠️ Note: Current setup uses synchronous SQLAlchemy
# Only use async if properly configured with AsyncSession
```

## Environment Configuration

```python
# ✅ Good: Type-safe configuration with Pydantic
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

## Testing

```python
# ✅ Good: Test with fixtures and proper setup
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def client():
    """Test client fixture."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c

def test_create_project(client):
    """Test project creation."""
    response = client.post(
        "/api/projects/",
        json={"name": "Test Project", "description": "Test"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
```

## Common Anti-Patterns to Avoid

1. ❌ **Don't use `dict` instead of Pydantic models**
   ```python
   # Bad
   @app.post("/projects")
   async def create_project(project: dict):
       pass
   
   # Good
   @app.post("/projects")
   async def create_project(project: ProjectCreate):
       pass
   ```

2. ❌ **Don't forget to close database sessions**
   - Always use `Depends(get_db)` or context managers

3. ❌ **Don't mix coordinate systems**
   - Always store as EPSG:4326
   - Document any transformations

4. ❌ **Don't ignore SQL injection risks**
   - Use SQLAlchemy ORM (handles parameterization)
   - Never build raw SQL from user input

5. ❌ **Don't return database models directly**
   - Always use Pydantic response models
   - Prevents exposing internal fields

## Performance

- Use database indexes on frequently queried columns
- Use `.limit()` and `.offset()` for pagination
- Use spatial indexes (`GIST`) for geometry columns
- Cache expensive operations when appropriate
- Use connection pooling (SQLAlchemy default)
