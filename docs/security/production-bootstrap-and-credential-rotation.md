# Production bootstrap and credential rotation

## Before the first production start

Configure these values in the deployment environment or a private, untracked `.env` file:

- `SECRET_KEY`: a unique random secret of at least 32 characters.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`: database credentials. Use a URL-safe password for the Compose-generated database URL (for example, generate a hex value with `openssl rand -hex 32`).
- `INITIAL_SUPERADMIN_PASSWORD`: a one-time bootstrap password of at least 14 characters, only when creating a new database with no platform administrator.

The Compose file requires the database and application secrets; it intentionally has no insecure password defaults. PostgreSQL and Redis are internal to the Compose network and are not published on host ports.

## Platform administrator bootstrap

On a new database, the seed routine creates `admin@platform.erp.in` only when `INITIAL_SUPERADMIN_PASSWORD` is supplied. In production, that account is marked to change its password at first sign-in.

The seed routine does not reset an existing platform administrator's password or profile. If the account already exists, setting `INITIAL_SUPERADMIN_PASSWORD` does not rotate it. Use the authenticated password-change/recovery process to rotate existing credentials.

After successful bootstrap, remove `INITIAL_SUPERADMIN_PASSWORD` from the deployment environment. Keep `SECRET_KEY` stable across restarts; rotating it invalidates existing JWTs.

## Existing installations: rotate legacy seeded accounts

Earlier application versions contained static preview credentials and seeded demonstration accounts. Removing the client-side fallback and server-side alternate-password branches does not automatically change password hashes already stored in an existing database.

Before exposing an existing installation publicly:

1. Identify all platform and institutional accounts originally created from demo/seed data.
2. Reset their passwords to unique, operator-issued credentials.
3. Require MFA for platform administrators.
4. Verify each account's institution assignment and role before re-enabling access.
5. Review authentication and account-security audit events for unexpected access.

Do not copy passwords from source code, commit secrets, or send credentials through chat or issue comments.

## Demo data

Automatic demonstration-tenant and demonstration-account seeding is restricted to non-production environments. Production institutions should be created through the authenticated institution-onboarding workflow. Existing production tenant records are not deleted by this change.


## Database application role and existing volumes

Fresh Docker Compose installations create a dedicated `erp_app` role with `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, and `NOBYPASSRLS`. The API connects as this role, not as the PostgreSQL cluster administrator. PostgreSQL and Redis remain private to the Compose network.

The PostgreSQL `/docker-entrypoint-initdb.d` script runs only when the data directory is initialized for the first time. It does **not** run again for an existing named volume. Do not delete the volume to make it run.

For an existing database, do not simply switch `DATABASE_URL` to `erp_app`. The existing tables are likely owned by the old database user, while application startup currently creates tables and enables/forces RLS. A database administrator must first back up the database, review the ownership change for this dedicated ERP database, create the `erp_app` role, and transfer ownership of the ERP schema tables and sequences. Schedule and approve that operation separately; this repository change does not connect to or modify any production database.

The test suite now separates a privileged bootstrap connection from the application test connection so API tests can run as the non-superuser `erp_app` role and exercise forced RLS rather than silently bypassing it as PostgreSQL superuser.
