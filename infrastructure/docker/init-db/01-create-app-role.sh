#!/bin/sh
set -eu

: "${ERP_APP_PASSWORD:?ERP_APP_PASSWORD is required to create the application database role}"

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=app_password="$ERP_APP_PASSWORD" \
  --set=app_database="$POSTGRES_DB" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'erp_app'
  ) THEN
    CREATE ROLE erp_app
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS;
  END IF;
END
$$;

ALTER ROLE erp_app
  WITH LOGIN
  PASSWORD :'app_password'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOBYPASSRLS;

GRANT CONNECT ON DATABASE :"app_database" TO erp_app;
GRANT USAGE, CREATE ON SCHEMA public TO erp_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_app;
SQL
