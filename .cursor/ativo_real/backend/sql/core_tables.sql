CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS core_tenant (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_user (
  id BIGSERIAL PRIMARY KEY,
  password VARCHAR(128) NOT NULL,
  last_login TIMESTAMPTZ NULL,
  is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
  username VARCHAR(150) NOT NULL UNIQUE,
  first_name VARCHAR(150) NOT NULL DEFAULT '',
  last_name VARCHAR(150) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '',
  is_staff BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role VARCHAR(20) NOT NULL DEFAULT 'proprietario',
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS core_project (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  owner_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_parcel (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES core_project(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  boundary geometry(MultiPolygon, 4326) NOT NULL,
  area_sq_m NUMERIC(14, 2) NULL,
  perimeter_m NUMERIC(14, 2) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_budget (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL UNIQUE REFERENCES core_project(id) ON DELETE CASCADE,
  total_value NUMERIC(14, 2) NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_payment (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES core_project(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL,
  received_at DATE NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS core_expense (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES core_project(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL,
  paid_at DATE NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS core_document (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES core_tenant(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES core_project(id) ON DELETE CASCADE,
  doc_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  file VARCHAR(100) NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS core_user_tenant_id_idx ON core_user(tenant_id);
CREATE INDEX IF NOT EXISTS core_project_tenant_id_idx ON core_project(tenant_id);
CREATE INDEX IF NOT EXISTS core_project_owner_id_idx ON core_project(owner_id);
CREATE INDEX IF NOT EXISTS core_parcel_project_id_idx ON core_parcel(project_id);
CREATE INDEX IF NOT EXISTS core_parcel_tenant_id_idx ON core_parcel(tenant_id);
CREATE INDEX IF NOT EXISTS core_budget_tenant_id_idx ON core_budget(tenant_id);
CREATE INDEX IF NOT EXISTS core_payment_project_id_idx ON core_payment(project_id);
CREATE INDEX IF NOT EXISTS core_payment_tenant_id_idx ON core_payment(tenant_id);
CREATE INDEX IF NOT EXISTS core_expense_project_id_idx ON core_expense(project_id);
CREATE INDEX IF NOT EXISTS core_expense_tenant_id_idx ON core_expense(tenant_id);
CREATE INDEX IF NOT EXISTS core_document_project_id_idx ON core_document(project_id);
CREATE INDEX IF NOT EXISTS core_document_tenant_id_idx ON core_document(tenant_id);
