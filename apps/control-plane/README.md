# EducationOS Control Plane

This is a separately deployed control-plane service. It manages institution metadata, deployment requests, subscriptions, module entitlements, signed license issuance, release metadata, staged rollout plans, and audited support grants.

**It must never store student, parent, teacher, staff, fee, attendance, examination, payroll, or admission records.**

## Architecture boundary

- Control plane: this service and its own PostgreSQL database.
- Data plane: the existing EducationOS FastAPI application, PostgreSQL database, and private object storage deployed independently for each institution.
- The control plane stores only deployment references and secret-manager reference identifiers. It must not store cloud credentials, database URLs, private encryption keys, or institutional records.
- Managed-cloud deployments are operated by the vendor; customer-cloud deployments run in an institution-controlled cloud account.
- Both modes use the same signed release artifacts.

## Local development

1. Copy `.env.example` to `.env`.
2. Set a random `PLATFORM_ADMIN_TOKEN` of at least 32 characters.
3. Set a local PostgreSQL `DATABASE_URL`, or use SQLite for a disposable local smoke test.
4. Set `AUTO_CREATE_SCHEMA=true` only for local development.
5. Install dependencies and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8100
```

All `/platform/v1/*` routes require `Authorization: Bearer <PLATFORM_ADMIN_TOKEN>`. The health endpoint is public.

## License signing

Generate an Ed25519 key pair outside the repository and store the private key only in a secret manager:

```bash
openssl genpkey -algorithm ED25519 -out license-private.pem
openssl pkey -in license-private.pem -pubout -out license-public.pem
```

Configure `LICENSE_PRIVATE_KEY_PEM` only in the control-plane secret store. Distribute the public key to institution deployments. Never distribute the private key. License tokens are signed with EdDSA and contain institution/deployment identity, plan, enabled module codes, issuer, audience, issue time and expiry.

The institution ERP must independently verify the token locally using the public key and enforce module entitlements in backend authorization. A UI-only feature gate is insufficient.

## Database and production

- Set `AUTO_CREATE_SCHEMA=false` in every production environment.
- Apply reviewed schema migrations before deploying this service. The initial schema is described in `migrations/001_initial.sql`.
- Use a dedicated PostgreSQL database and least-privilege database role for the control plane.
- Put the service behind HTTPS, network restrictions, rate limits, secret management, MFA-backed operator SSO and an audited admin gateway.
- Replace the bootstrap bearer-token dependency with the organization's SSO/OIDC and fine-grained platform roles before exposing the admin API to multiple operators.
- Back up this database independently from every institution's data-plane database.

## Explicit implementation boundaries

This first control-plane slice records deployment and rollout requests but does not provision cloud infrastructure or execute updates. A production provider worker must be added for each supported cloud (for example AWS, Azure, GCP, or a customer's approved provider), using short-lived workload identity and customer-authorized roles. Do not put cloud credentials in this service's database.

Support approval creates an auditable approval record only. It does not create a remote support session. The institution data-plane must integrate grant verification, scoped session issuance, expiry and revocation before support access is enabled.

Automatic updates must use signed immutable images, canary stages, health gates, backward-compatible migrations and rollback orchestration. Do not automatically apply an unreviewed destructive migration.

## API summary

- `GET /health`
- `GET /platform/v1/dashboard`
- `POST /platform/v1/institutions`
- `GET /platform/v1/institutions`
- `POST /platform/v1/institutions/{id}/deployments`
- `POST /platform/v1/institutions/{id}/subscriptions`
- `PUT /platform/v1/institutions/{id}/modules`
- `POST /platform/v1/institutions/{id}/licenses`
- `POST /platform/v1/releases`
- `POST /platform/v1/rollouts`
- `POST /platform/v1/support-grants`
- `POST /platform/v1/support-grants/{id}/approve`
- `POST /platform/v1/support-grants/{id}/revoke`

OpenAPI is available at `/docs` in a local development environment. Disable public API documentation in production or protect it behind operator authentication.
