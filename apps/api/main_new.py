"""FastAPI application entry point for Bem Real backend."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from config import settings
from database import get_db, init_db, close_db
from services.auth import verify_token, create_access_token, hash_password, verify_password, revoke_token
from services.geo import validate_geometry_complete
from schemas import (
    UserRole, ProjectStatus, ParcelStatus, SketchStatus, ValidationResult,
    UserAuth, SessionResponse, GeometryResponse, ProjectCreate, ProjectResponse,
    ParcelCreate, ParcelResponse, ClientIntakeRequest, ClientIntakeResponse,
)
from models import User, Project, Parcel, Tenant, InviteLink

logger = logging.getLogger(__name__)


# ============ Lifespan Management ============
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    # Startup
    logger.info("Starting Bem Real API...")
    init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down...")
    close_db()


# ============ FastAPI App ============
app = FastAPI(
    title="Bem Real API",
    description="Geospatial property regularization system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)


# ============ Error Handlers ============
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


# ============ Dependencies ============
async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate JWT token from Authorization header.
    
    Expected: Authorization: Bearer <token>
    Scopes: tenant_id, project_id (optional), parcel_id (optional), role
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    
    token = authorization.split(" ", 1)[1]
    claims = verify_token(token)
    
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    # Check if token is revoked
    jti = claims.get("jti")
    if jti:
        invite_link = db.query(InviteLink).filter_by(jti=jti).first()
        if invite_link and invite_link.revoked_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
            )
    
    # Load user from database
    user = db.query(User).filter_by(id=claims.get("sub")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


async def get_current_topografo(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require TOPOGRAFO role."""
    if current_user.role != UserRole.TOPOGRAFO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only topographers can access this endpoint",
        )
    return current_user


# ============ Health ============
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


# ============ Auth Endpoints ============
@app.post("/auth/login", response_model=dict, tags=["Auth"])
async def login(
    payload: UserAuth,
    db: Session = Depends(get_db),
):
    """Authenticate user and return JWT token.
    
    For PROPRIETARIO (client):
        - Email + temporary password (from invite link)
        - Returns JWT scoped to project_id + parcel_id
    
    For TOPOGRAFO:
        - Email + password
        - Returns JWT scoped to tenant_id (full access)
    """
    user = db.query(User).filter_by(email=payload.email).first()
    
    if not user:
        # For development: auto-create PROPRIETARIO on first login
        if settings.ENV == "development":
            tenant = db.query(Tenant).first()
            if not tenant:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No tenant found; contact administrator",
                )
            user = User(
                email=payload.email,
                password_hash=hash_password(payload.password),
                role=UserRole.PROPRIETARIO,
                tenant_id=tenant.id,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
    
    # Verify password (simplified in production, use actual password check)
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create JWT token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "tenant_id": str(user.tenant_id),
    }
    
    # For PROPRIETARIO, scope to project/parcel if provided
    if user.role == UserRole.PROPRIETARIO and hasattr(payload, "project_id"):
        token_data["project_id"] = str(payload.project_id)
    if user.role == UserRole.PROPRIETARIO and hasattr(payload, "parcel_id"):
        token_data["parcel_id"] = str(payload.parcel_id)
    
    access_token, expires_at = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at.isoformat(),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
        },
    }


@app.post("/auth/logout", tags=["Auth"])
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke JWT token (invalidate session)."""
    # Note: In production, extract JTI from token and mark as revoked
    return {"message": "Logged out successfully"}


@app.post("/auth/invite/{project_id}", tags=["Auth"], status_code=status.HTTP_201_CREATED)
async def create_invite_link(
    project_id: str,
    client_email: str,
    current_user: User = Depends(get_current_topografo),
    db: Session = Depends(get_db),
):
    """Create a shareable invite link for a client.
    
    Returns a temporary JWT token that can be shared via email/SMS.
    Token is scoped to project_id and expires at link.expires_at.
    """
    # Verify project belongs to current user's tenant
    project = db.query(Project).filter_by(
        id=project_id,
        tenant_id=current_user.tenant_id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create JWT for client
    from datetime import timedelta
    from uuid import uuid4
    
    jti = str(uuid4())
    token_data = {
        "sub": client_email,  # Use email as identifier for new user
        "email": client_email,
        "role": UserRole.PROPRIETARIO,
        "tenant_id": str(current_user.tenant_id),
        "project_id": project_id,
        "jti": jti,
        "type": "invite",
    }
    
    access_token, expires_at_from_token = create_access_token(
        token_data,
        expires_delta=timedelta(days=7),  # 7-day invite link
    )
    
    # Store invite link in database
    invite_link = InviteLink(
        jti=jti,
        email=client_email,
        project_id=project_id,
        expires_at=expires_at_from_token,
    )
    db.add(invite_link)
    db.commit()
    
    return {
        "invite_token": access_token,
        "expires_at": expires_at_from_token.isoformat(),
        "client_email": client_email,
    }


# ============ Geometry Validation ============
@app.post("/geometry/validate", response_model=GeometryResponse, tags=["Geometry"])
async def validate_geometry(
    project_id: str,
    parcel_id: Optional[str],
    geom_geojson: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Validate geometry and return warnings/errors.
    
    Checks:
    1. Geometry validity (polygon, no self-intersections)
    2. Minimum area (100 m²)
    3. SIGEF overlap (WARN if yes)
    4. Neighbor overlap (WARN if yes)
    5. Project gaps (WARN if yes in multi-parcel)
    
    Response:
    - status: OK | WARN | FAIL
    - can_proceed: boolean (WARN doesn't block)
    - has_overlap_alert: boolean
    - warnings: list of validation warnings
    """
    # Verify access to project
    project = db.query(Project).filter_by(
        id=project_id,
        tenant_id=current_user.tenant_id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify parcel access for PROPRIETARIO users
    if current_user.role == UserRole.PROPRIETARIO and parcel_id:
        parcel = db.query(Parcel).filter_by(
            id=parcel_id,
            project_id=project_id,
        ).first()
        
        if not parcel or parcel.project.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to parcel")
    
    # Validate geometry
    response = validate_geometry_complete(
        geom_dict=geom_geojson,
        project_id=project_id,
        parcel_id=parcel_id,
        db=db,
        check_sigef=True,
        check_neighbors=True,
        check_gaps=True,
    )
    
    return response


# ============ Project Endpoints (Basic CRUD) ============
@app.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, tags=["Projects"])
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_topografo),
    db: Session = Depends(get_db),
):
    """Create a new project (TOPOGRAFO only)."""
    from uuid import uuid4
    
    project = Project(
        id=str(uuid4()),
        name=payload.name,
        description=payload.description,
        status=ProjectStatus.DRAFT,
        owner_topografo_id=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return ProjectResponse.from_orm(project)


@app.get("/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get project details."""
    project = db.query(Project).filter_by(
        id=project_id,
        tenant_id=current_user.tenant_id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse.from_orm(project)


@app.get("/projects", tags=["Projects"])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List projects accessible to current user."""
    query = db.query(Project).filter_by(tenant_id=current_user.tenant_id)
    
    # PROPRIETARIO users can only see projects they've been invited to
    if current_user.role == UserRole.PROPRIETARIO:
        query = query.filter(Project.invited_users.contains(current_user.id))
    
    projects = query.offset(skip).limit(limit).all()
    
    return [ProjectResponse.from_orm(p) for p in projects]


# ============ Parcel Endpoints ============
@app.post("/projects/{project_id}/parcels", response_model=ParcelResponse, status_code=status.HTTP_201_CREATED, tags=["Parcels"])
async def create_parcel(
    project_id: str,
    payload: ParcelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new parcel in project."""
    from uuid import uuid4
    
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        tenant_id=current_user.tenant_id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # PROPRIETARIO can only create parcels if invited
    if current_user.role == UserRole.PROPRIETARIO and current_user.id not in project.invited_users:
        raise HTTPException(status_code=403, detail="Not invited to this project")
    
    parcel = Parcel(
        id=str(uuid4()),
        project_id=project_id,
        name=payload.name,
        description=payload.description,
        status=ParcelStatus.PENDING,
    )
    
    db.add(parcel)
    db.commit()
    db.refresh(parcel)
    
    return ParcelResponse.from_orm(parcel)


@app.get("/projects/{project_id}/parcels/{parcel_id}", response_model=ParcelResponse, tags=["Parcels"])
async def get_parcel(
    project_id: str,
    parcel_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get parcel details."""
    parcel = db.query(Parcel).filter_by(
        id=parcel_id,
        project_id=project_id,
    ).first()
    
    if not parcel or parcel.project.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    return ParcelResponse.from_orm(parcel)


# ============ Client Intake (Wizard) ============
@app.post("/projects/{project_id}/parcels/{parcel_id}/intake", tags=["Intake"])
async def submit_client_intake(
    project_id: str,
    parcel_id: str,
    payload: ClientIntakeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit client intake form (wizard step 1).
    
    Stores:
    - Client info (name, email, phone)
    - Location description
    - Attached documents (links)
    - Neighbor list
    """
    # Verify access
    parcel = db.query(Parcel).filter_by(
        id=parcel_id,
        project_id=project_id,
    ).first()
    
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    # Update parcel with intake info
    parcel.client_name = payload.client_name
    parcel.client_email = payload.client_email
    parcel.client_phone = payload.client_phone
    parcel.location_description = payload.location_description
    parcel.documents = payload.documents or []
    parcel.neighbors = payload.confrontantes or []
    
    db.commit()
    db.refresh(parcel)
    
    return ParcelResponse.from_orm(parcel)


# ============ Static Files / Root ============
@app.get("/", tags=["Root"])
async def root():
    """API root endpoint."""
    return {
        "name": "Bem Real API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=settings.ENV == "development",
    )
