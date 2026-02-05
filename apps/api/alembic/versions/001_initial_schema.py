"""Initial schema: multitenancy, geospatial, projects, payments, contracts.

Revision ID: 001
Revises: 
Create Date: 2026-02-05 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable PostGIS extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "postgis"')
    
    # ============ TENANCY & AUTH ============
    op.create_table(
        'tenant',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_tenant_slug', 'tenant', ['slug'])
    
    op.create_table(
        'app_user',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255)),
        sa.Column('role', sa.Enum('TOPOGRAFO', 'PROPRIETARIO', name='user_role'), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'SUSPENDED', name='user_status'), default='ACTIVE'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_app_user_tenant_email', 'app_user', ['tenant_id', 'email'], unique=True)
    op.create_index('ix_app_user_role', 'app_user', ['role'])
    
    # ============ PROJECTS & PARCELS ============
    op.create_table(
        'project',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False),
        sa.Column('owner_topografo_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('status', sa.Enum('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', name='project_status'), default='DRAFT'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_project_tenant_status', 'project', ['tenant_id', 'status'])
    op.create_index('ix_project_owner', 'project', ['owner_topografo_id'])
    
    op.create_table(
        'parcel',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role_owner_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('geom_client_sketch', Geometry('MultiPolygon', srid=4326, spatial_index=True), nullable=True),
        sa.Column('geom_official', Geometry('MultiPolygon', srid=4326, spatial_index=True), nullable=True),
        sa.Column('area_m2', sa.Float, nullable=True),
        sa.Column('perimeter_m', sa.Float, nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'SKETCH_APPROVED', 'OFFICIAL_APPROVED', 'REJECTED', name='parcel_status'), default='PENDING'),
        sa.Column('sketch_status', sa.Enum('pending', 'approved', 'rejected', 'request_revision', name='sketch_status_enum'), default='pending'),
        sa.Column('has_overlap_alert', sa.Boolean, default=False),
        sa.Column('reviewed_by_topografo_at', sa.DateTime, nullable=True),
        sa.Column('reviewed_notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_parcel_project', 'parcel', ['project_id'])
    op.create_index('ix_parcel_owner', 'parcel', ['role_owner_user_id'])
    op.create_index('ix_parcel_status', 'parcel', ['status'])
    
    # ============ CONTRACTS ============
    op.create_table(
        'contract_template',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenant.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('hash', sa.String(64), nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_contract_template_tenant_version', 'contract_template', ['tenant_id', 'version'], unique=True)
    
    op.create_table(
        'contract_acceptance',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True),
        sa.Column('template_version', sa.String(50), nullable=False),
        sa.Column('accepted_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('ip', postgresql.INET, nullable=True),
    )
    op.create_index('ix_contract_acceptance_parcel', 'contract_acceptance', ['parcel_id'])
    
    # ============ PAYMENTS ============
    op.create_table(
        'payment_intent',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount_cents', sa.BigInteger, nullable=False),
        sa.Column('currency', sa.String(3), default='BRL'),
        sa.Column('status', sa.Enum('pending', 'requires_action', 'paid', 'failed', 'refunded', 'expired', name='payment_status'), default='pending'),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('provider_ref', sa.String(255), nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('paid_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_payment_intent_parcel', 'payment_intent', ['parcel_id'])
    op.create_index('ix_payment_intent_status', 'payment_intent', ['status'])
    
    op.create_table(
        'payment_receipt',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('payment_intent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payment_intent.id', ondelete='CASCADE'), nullable=False),
        sa.Column('url', sa.Text, nullable=False),
        sa.Column('issued_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_payment_receipt_intent', 'payment_receipt', ['payment_intent_id'])
    
    # ============ TIMELINE & TO-DOS ============
    op.create_table(
        'milestone',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('ord', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_milestone_project_ord', 'milestone', ['project_id', 'ord'])
    
    op.create_table(
        'milestone_status',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('milestone_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('milestone.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'blocked', name='milestone_status_enum'), default='pending'),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_milestone_status_parcel', 'milestone_status', ['parcel_id', 'milestone_id'], unique=True)
    
    op.create_table(
        'todo',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('status', sa.Enum('pending', 'completed', 'cancelled', name='todo_status'), default='pending'),
        sa.Column('due_at', sa.DateTime, nullable=True),
        sa.Column('assignee_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_todo_parcel', 'todo', ['parcel_id'])
    op.create_index('ix_todo_status', 'todo', ['status'])
    
    # ============ GEOSPATIAL REFERENCE (SIGEF/INCRA) ============
    op.create_table(
        'sigef_certified',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('geom', Geometry('MultiPolygon', srid=4326, spatial_index=True), nullable=False),
        sa.Column('owner', sa.String(255), nullable=True),
        sa.Column('cert_id', sa.String(255), unique=True, nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_sigef_cert_id', 'sigef_certified', ['cert_id'])
    
    # ============ VALIDATION EVENTS ============
    op.create_table(
        'validation_event',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.Enum('SIGEF_OVERLAP', 'NEIGHBOR_OVERLAP', 'GAP_DETECTED', 'GEOM_INVALID', name='validation_type'), nullable=False),
        sa.Column('result', sa.Enum('OK', 'WARN', 'FAIL', name='validation_result'), nullable=False),
        sa.Column('severity', sa.Enum('INFO', 'WARN', 'ERROR', name='validation_severity'), default='INFO'),
        sa.Column('details', postgresql.JSON, nullable=True),
        sa.Column('checked_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_validation_event_parcel', 'validation_event', ['parcel_id', 'checked_at'])
    
    # ============ LINK INVITATIONS (REVOCATION) ============
    op.create_table(
        'invite_link',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=False),
        sa.Column('jti', sa.String(255), unique=True, nullable=False),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('revoked_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_invite_link_jti', 'invite_link', ['jti'])
    op.create_index('ix_invite_link_parcel', 'invite_link', ['parcel_id'])
    
    # ============ DOCUMENTS (PEÇAS TÉCNICAS) ============
    op.create_table(
        'document',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('project.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parcel_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('parcel.id', ondelete='CASCADE'), nullable=True),
        sa.Column('type', sa.Enum('MATRICULA', 'CAR', 'CROQUI', 'RG_CPF', 'COMPROVANTE', 'ART', 'MEMORIAL', 'SIGEF_EXPORT', 'OTHER', name='document_type'), nullable=False),
        sa.Column('url', sa.Text, nullable=False),
        sa.Column('hash', sa.String(64), nullable=True),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('app_user.id', ondelete='SET NULL'), nullable=True),
        sa.Column('uploaded_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_document_project', 'document', ['project_id'])
    op.create_index('ix_document_parcel', 'document', ['parcel_id'])
    op.create_index('ix_document_type', 'document', ['type'])


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('document')
    op.drop_table('invite_link')
    op.drop_table('validation_event')
    op.drop_table('sigef_certified')
    op.drop_table('todo')
    op.drop_table('milestone_status')
    op.drop_table('milestone')
    op.drop_table('payment_receipt')
    op.drop_table('payment_intent')
    op.drop_table('contract_acceptance')
    op.drop_table('contract_template')
    op.drop_table('parcel')
    op.drop_table('project')
    op.drop_table('app_user')
    op.drop_table('tenant')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS user_role CASCADE')
    op.execute('DROP TYPE IF EXISTS user_status CASCADE')
    op.execute('DROP TYPE IF EXISTS project_status CASCADE')
    op.execute('DROP TYPE IF EXISTS parcel_status CASCADE')
    op.execute('DROP TYPE IF EXISTS sketch_status_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS payment_status CASCADE')
    op.execute('DROP TYPE IF EXISTS milestone_status_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS todo_status CASCADE')
    op.execute('DROP TYPE IF EXISTS validation_type CASCADE')
    op.execute('DROP TYPE IF EXISTS validation_result CASCADE')
    op.execute('DROP TYPE IF EXISTS validation_severity CASCADE')
    op.execute('DROP TYPE IF EXISTS document_type CASCADE')
