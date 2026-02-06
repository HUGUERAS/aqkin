"""Pydantic schemas for API requests/responses."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


# ============ Enums ============
class UserRole(str, Enum):
    TOPOGRAFO = "TOPOGRAFO"
    PROPRIETARIO = "PROPRIETARIO"


class ProjectStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class ParcelStatus(str, Enum):
    PENDING = "PENDING"
    SKETCH_APPROVED = "SKETCH_APPROVED"
    OFFICIAL_APPROVED = "OFFICIAL_APPROVED"
    REJECTED = "REJECTED"


class SketchStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUEST_REVISION = "request_revision"


class ValidationResult(str, Enum):
    OK = "OK"
    WARN = "WARN"
    FAIL = "FAIL"


class DocumentType(str, Enum):
    MATRICULA = "MATRICULA"
    CAR = "CAR"
    CROQUI = "CROQUI"
    RG_CPF = "RG_CPF"
    COMPROVANTE = "COMPROVANTE"
    ART = "ART"
    MEMORIAL = "MEMORIAL"
    SIGEF_EXPORT = "SIGEF_EXPORT"
    OTHER = "OTHER"


# ============ Auth & Users ============
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    tenant_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class InviteLinkRequest(BaseModel):
    project_id: UUID
    parcel_id: UUID
    email: str
    expires_in_minutes: int = 1440  # 24 hours


# ============ Projects ============
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.DRAFT


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: UUID
    tenant_id: UUID
    owner_topografo_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Intakes (Client Form) ============
class ClientIntakeRequest(BaseModel):
    name: str = Field(..., min_length=1)
    contact: Dict[str, str] = Field(...)  # { email, phone }
    location_hint: Dict[str, Any] = Field(default={})  # { text, marker: {lat, lng} }
    sketch_upload_url: Optional[str] = None
    docs: Optional[Dict[str, str]] = None  # { matricula_url, car_url, etc }
    land_use: Optional[str] = None
    confrontantes: Optional[List[Dict[str, str]]] = None
    history: Optional[Dict[str, Any]] = None


class ClientIntakeResponse(ClientIntakeRequest):
    parcel_id: UUID
    saved_at: datetime


# ============ Parcels & Geometry ============
class ParcelBase(BaseModel):
    name: str
    status: ParcelStatus = ParcelStatus.PENDING


class ParcelCreate(ParcelBase):
    pass


class GeometryRequest(BaseModel):
    geojson: Dict[str, Any] = Field(..., description="GeoJSON Polygon/MultiPolygon")
    srid: int = Field(default=4326, description="Spatial Reference System ID")


class ValidationWarning(BaseModel):
    type: str
    details: Optional[Dict[str, Any]] = None


class GeometryResponse(BaseModel):
    status: ValidationResult = ValidationResult.OK
    can_proceed: bool = True
    has_overlap_alert: bool = False
    area_m2: Optional[float] = None
    perimeter_m: Optional[float] = None
    warnings: List[ValidationWarning] = []
    message: Optional[str] = None
    code: Optional[str] = None


class ParcelResponse(ParcelBase):
    id: UUID
    project_id: UUID
    role_owner_user_id: Optional[UUID]
    area_m2: Optional[float]
    perimeter_m: Optional[float]
    sketch_status: SketchStatus
    has_overlap_alert: bool
    reviewed_by_topografo_at: Optional[datetime]
    reviewed_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Contracts ============
class ContractAcceptRequest(BaseModel):
    template_version: str
    ip: Optional[str] = None


class ContractAcceptResponse(BaseModel):
    status: str = "OK"
    accepted_at: datetime
    parcel_id: UUID


class ContractTemplateResponse(BaseModel):
    id: UUID
    version: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Payments ============
class PaymentIntentRequest(BaseModel):
    project_id: UUID
    parcel_id: UUID
    amount_cents: int
    currency: str = "BRL"


class PaymentIntentResponse(BaseModel):
    id: UUID
    status: str
    checkout_url: Optional[str] = None
    pix_code: Optional[str] = None
    amount_cents: int
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentWebhook(BaseModel):
    provider: str
    provider_ref: str
    status: str  # paid, failed, refunded, etc
    paid_at: Optional[datetime] = None


# ============ Timeline ============
class MilestoneCreate(BaseModel):
    name: str
    ord: int = 0


class MilestoneResponse(MilestoneCreate):
    id: UUID
    project_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MilestoneStatusResponse(BaseModel):
    id: UUID
    project_id: UUID
    parcel_id: UUID
    milestone_id: UUID
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None


class TodoResponse(TodoCreate):
    id: UUID
    project_id: UUID
    parcel_id: UUID
    status: str
    assignee_user_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Documents ============
class DocumentUploadRequest(BaseModel):
    type: DocumentType
    parcel_id: Optional[UUID] = None


class DocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    parcel_id: Optional[UUID]
    type: DocumentType
    url: str
    uploaded_by: Optional[UUID]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ============ Session (for client on entry) ============
class ParcelSession(BaseModel):
    id: UUID
    name: str
    status: ParcelStatus
    sketch_status: SketchStatus
    has_overlap_alert: bool
    area_m2: Optional[float]


class ProjectSession(BaseModel):
    id: UUID
    name: str
    status: ProjectStatus


class SessionResponse(BaseModel):
    project: ProjectSession
    parcel: ParcelSession
    milestones: List[MilestoneResponse]
    todos: List[TodoResponse]
    payment_intents: List[PaymentIntentResponse]
    contract_template: Optional[ContractTemplateResponse]
    
    class Config:
        from_attributes = True


# ============ Contract Schemas ============
class ContractAcceptRequest(BaseModel):
    """Request to accept a contract."""
    signature: str = Field(..., description="Digital signature")
    accepted_at: datetime = Field(default_factory=datetime.utcnow)


class ContractAcceptResponse(BaseModel):
    """Response after accepting a contract."""
    success: bool
    message: str
    contract_id: Optional[UUID] = None


class ContractTemplateResponse(BaseModel):
    """Contract template response."""
    id: UUID
    title: str
    content: str
    version: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Budget/Orcamento Schemas ============
class OrcamentoBase(BaseModel):
    """Base orcamento (budget) schema."""
    projeto_id: UUID
    titulo: str
    descricao: Optional[str] = None
    valor_total: float
    data_validade: Optional[datetime] = None


class OrcamentoCreate(OrcamentoBase):
    """Schema for creating orcamento."""
    pass


class OrcamentoResponse(OrcamentoBase):
    """Response schema for orcamento."""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============ Projeto Alias ============
# Alias for compatibility with different naming conventions
ProjetoCreate = ProjectCreate
