-- Initial EducationOS Control Plane schema.
-- Apply only to the dedicated control-plane database.
CREATE TABLE IF NOT EXISTS platform_institutions (
  id varchar(36) PRIMARY KEY,
  code varchar(48) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  institution_type varchar(32) NOT NULL,
  deployment_mode varchar(32) NOT NULL,
  cloud_provider varchar(32),
  cloud_account_ref varchar(200),
  primary_domain varchar(253) UNIQUE,
  status varchar(24) NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_platform_institutions_code ON platform_institutions(code);

CREATE TABLE IF NOT EXISTS platform_deployments (
  id varchar(36) PRIMARY KEY,
  institution_id varchar(36) NOT NULL REFERENCES platform_institutions(id) ON DELETE CASCADE,
  mode varchar(32) NOT NULL,
  region varchar(64) NOT NULL,
  endpoint varchar(500),
  database_secret_ref varchar(200),
  storage_secret_ref varchar(200),
  desired_version varchar(40) NOT NULL DEFAULT '1.0.0',
  current_version varchar(40),
  status varchar(24) NOT NULL DEFAULT 'REQUESTED',
  last_health_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_platform_deployments_institution_id ON platform_deployments(institution_id);

CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id varchar(36) PRIMARY KEY,
  institution_id varchar(36) NOT NULL REFERENCES platform_institutions(id) ON DELETE CASCADE,
  plan_code varchar(40) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'TRIAL',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  grace_days integer NOT NULL DEFAULT 7,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_platform_subscriptions_institution_id ON platform_subscriptions(institution_id);

CREATE TABLE IF NOT EXISTS platform_module_entitlements (
  id varchar(36) PRIMARY KEY,
  institution_id varchar(36) NOT NULL REFERENCES platform_institutions(id) ON DELETE CASCADE,
  module_code varchar(64) NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  CONSTRAINT uq_institution_module UNIQUE(institution_id, module_code)
);
CREATE INDEX IF NOT EXISTS ix_platform_module_entitlements_institution_id ON platform_module_entitlements(institution_id);

CREATE TABLE IF NOT EXISTS platform_releases (
  id varchar(36) PRIMARY KEY,
  version varchar(40) NOT NULL UNIQUE,
  image_digest varchar(200) NOT NULL,
  signature_ref varchar(500) NOT NULL,
  channel varchar(24) NOT NULL DEFAULT 'stable',
  migration_level varchar(80) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'PUBLISHED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_rollouts (
  id varchar(36) PRIMARY KEY,
  release_id varchar(36) NOT NULL REFERENCES platform_releases(id) ON DELETE RESTRICT,
  channel varchar(24) NOT NULL,
  stage varchar(24) NOT NULL DEFAULT 'CANARY',
  percentage integer NOT NULL DEFAULT 1 CHECK (percentage BETWEEN 1 AND 100),
  status varchar(24) NOT NULL DEFAULT 'PLANNED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_support_grants (
  id varchar(36) PRIMARY KEY,
  institution_id varchar(36) NOT NULL REFERENCES platform_institutions(id) ON DELETE CASCADE,
  requested_by varchar(160) NOT NULL,
  approved_by varchar(160),
  reason text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  status varchar(24) NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_platform_support_grants_institution_id ON platform_support_grants(institution_id);

CREATE TABLE IF NOT EXISTS platform_audit_events (
  id varchar(36) PRIMARY KEY,
  actor varchar(160) NOT NULL,
  action varchar(100) NOT NULL,
  resource_type varchar(80) NOT NULL,
  resource_id varchar(80) NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_platform_audit_events_action ON platform_audit_events(action);
