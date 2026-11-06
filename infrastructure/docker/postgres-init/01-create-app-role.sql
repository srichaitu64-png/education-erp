-- Provision a dedicated application role. Never connect the ERP API as PostgreSQL superuser.
\getenv erp_app_password ERP_APP_PASSWORD

SELECT format(
    'CREATE ROLE erp_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS',
    :'erp_app_password'
)
WHERE NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'erp_app'
) \gexec

SELECT format(
    'ALTER ROLE erp_app WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS',
    :'erp_app_password'
) \gexec

GRANT CONNECT ON DATABASE education_erp_prod TO erp_app;
GRANT USAGE, CREATE ON SCHEMA public TO erp_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erp_app;
