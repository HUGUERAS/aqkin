"""SQLAlchemy models for Bem Real API (when migrating from Supabase to PostgreSQL)."""
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, DateTime, Boolean, ForeignKey, Enum, Index, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSON, INET
from geoalchemy2 import Geometry
import uuid
from datetime import datetime

Base = declarative_base()


class Tenant(Base):
    __tablename__ = 'tenant'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_tenant_slug', 'slug'),
    )


class User(Base):
    __tablename__ = 'app_user'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255))
    role = Column(Enum('TOPOGRAFO', 'PROPRIETARIO', name='user_role'), nullable=False)
    status = Column(Enum('ACTIVE', 'INACTIVE', 'SUSPENDED', name='user_status'), default='ACTIVE')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'email', name='ix_app_user_tenant_email'),
        Index('ix_app_user_role', 'role'),
    )


class Project(Base):
    __tablename__ = 'project'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False)
    owner_topografo_id = Column(UUID(as_uuid=True), ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', name='project_status'), default='DRAFT')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_project_tenant_status', 'tenant_id', 'status'),
        Index('ix_project_owner', 'owner_topografo_id'),
    )


class Parcel(Base):
    __tablename__ = 'parcel'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    role_owner_user_id = Column(UUID(as_uuid=True), ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True)
    name = Column(String(255), nullable=False)
    geom_client_sketch = Column(Geometry('MultiPolygon', srid=4326), nullable=True)
    geom_official = Column(Geometry('MultiPolygon', srid=4326), nullable=True)
    area_m2 = Column(Float, nullable=True)
    perimeter_m = Column(Float, nullable=True)
    status = Column(Enum('PENDING', 'SKETCH_APPROVED', 'OFFICIAL_APPROVED', 'REJECTED', name='parcel_status'), default='PENDING')
    sketch_status = Column(Enum('pending', 'approved', 'rejected', 'request_revision', name='sketch_status_enum'), default='pending')
    has_overlap_alert = Column(Boolean, default=False)
    reviewed_by_topografo_at = Column(DateTime, nullable=True)
    reviewed_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_parcel_project', 'project_id'),
        Index('ix_parcel_owner', 'role_owner_user_id'),
        Index('ix_parcel_status', 'status'),
    )


class ContractTemplate(Base):
    __tablename__ = 'contract_template'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False)
    version = Column(String(50), nullable=False)
    hash = Column(String(64), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'version', name='ix_contract_template_tenant_version'),
    )


class ContractAcceptance(Base):
    __tablename__ = 'contract_acceptance'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True)
    template_version = Column(String(50), nullable=False)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    ip = Column(INET, nullable=True)
    
    __table_args__ = (
        Index('ix_contract_acceptance_parcel', 'parcel_id'),
    )


class PaymentIntent(Base):
    __tablename__ = 'payment_intent'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default='BRL')
    status = Column(Enum('pending', 'requires_action', 'paid', 'failed', 'refunded', 'expired', name='payment_status'), default='pending')
    provider = Column(String(50), nullable=False)
    provider_ref = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_payment_intent_parcel', 'parcel_id'),
        Index('ix_payment_intent_status', 'status'),
    )


class PaymentReceipt(Base):
    __tablename__ = 'payment_receipt'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_intent_id = Column(UUID(as_uuid=True), ForeignKey('payment_intent.id', ondelete='CASCADE'), nullable=False)
    url = Column(Text, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_payment_receipt_intent', 'payment_intent_id'),
    )


class Milestone(Base):
    __tablename__ = 'milestone'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    ord = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_milestone_project_ord', 'project_id', 'ord'),
    )


class MilestoneStatus(Base):
    __tablename__ = 'milestone_status'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    milestone_id = Column(UUID(as_uuid=True), ForeignKey('milestone.id', ondelete='CASCADE'), nullable=False)
    status = Column(Enum('pending', 'in_progress', 'completed', 'blocked', name='milestone_status_enum'), default='pending')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('parcel_id', 'milestone_id', name='ix_milestone_status_parcel'),
    )


class Todo(Base):
    __tablename__ = 'todo'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum('pending', 'completed', 'cancelled', name='todo_status'), default='pending')
    due_at = Column(DateTime, nullable=True)
    assignee_user_id = Column(UUID(as_uuid=True), ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_todo_parcel', 'parcel_id'),
        Index('ix_todo_status', 'status'),
    )


class SigefCertified(Base):
    __tablename__ = 'sigef_certified'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    geom = Column(Geometry('MultiPolygon', srid=4326), nullable=False)
    owner = Column(String(255), nullable=True)
    cert_id = Column(String(255), unique=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_sigef_cert_id', 'cert_id'),
    )


class ValidationEvent(Base):
    __tablename__ = 'validation_event'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    type = Column(Enum('SIGEF_OVERLAP', 'NEIGHBOR_OVERLAP', 'GAP_DETECTED', 'GEOM_INVALID', name='validation_type'), nullable=False)
    result = Column(Enum('OK', 'WARN', 'FAIL', name='validation_result'), nullable=False)
    severity = Column(Enum('INFO', 'WARN', 'ERROR', name='validation_severity'), default='INFO')
    details = Column(JSON, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_validation_event_parcel', 'parcel_id', 'checked_at'),
    )


class InviteLink(Base):
    __tablename__ = 'invite_link'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False)
    jti = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_invite_link_jti', 'jti'),
        Index('ix_invite_link_parcel', 'parcel_id'),
    )


class Document(Base):
    __tablename__ = 'document'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey('parcel.id', ondelete='CASCADE'), nullable=True)
    type = Column(Enum('MATRICULA', 'CAR', 'CROQUI', 'RG_CPF', 'COMPROVANTE', 'ART', 'MEMORIAL', 'SIGEF_EXPORT', 'OTHER', name='document_type'), nullable=False)
    url = Column(Text, nullable=False)
    hash = Column(String(64), nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_document_project', 'project_id'),
        Index('ix_document_parcel', 'parcel_id'),
        Index('ix_document_type', 'type'),
    )
