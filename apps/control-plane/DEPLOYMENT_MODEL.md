# EducationOS multi-institution deployment model

## Chosen model

One product repository and release train; independent data-plane deployments per institution; separate central control-plane database.

### Managed cloud

The vendor operates isolated application, database, storage, network, backup and key resources for each institution. Tenant data remains logically and cryptographically separated. Contract and access policy must define who can administer infrastructure.

### Customer-owned cloud

The institution owns the cloud account, billing relationship, network boundary, database, object storage, backups and encryption keys. The institution grants a scoped deployment identity to the release agent. Prefer workload identity/federation and short-lived credentials. Never ask customers to paste long-lived cloud access keys into the control-plane database.

## Control-plane data allowed

Institution code/name/type, deployment mode, cloud account reference (not credentials), domain, release version, plan, module entitlements, license metadata, deployment status, health timestamps, support-grant metadata and platform audit events.

## Data-plane data not allowed in control plane

Student, parent, applicant, staff, teacher, payroll, marks, attendance, fee transactions, payment identifiers, documents, photographs, credentials, or database contents. Do not send these in telemetry, exception messages, traces or support bundles.

## Tenant deployment contract

Each deployment must have:
- its own application environment and secrets;
- its own PostgreSQL database and non-owner runtime role;
- its own storage bucket/container and encryption boundary;
- separate backup retention and restore permissions;
- a unique deployment ID bound to a signed license;
- outbound-only control-plane connectivity where feasible;
- a locally cached, signed license and bounded offline grace period;
- no permanent vendor shell, database or application support account.

## Automatic updates

1. Build once from a reviewed commit.
2. Generate immutable image digest and signed provenance.
3. Run unit, integration, security and migration-compatibility tests.
4. Back up target database and verify backup age.
5. Deploy to internal test, then pilot, canary and staged stable cohorts.
6. Run health and smoke checks before advancing.
7. Stop rollout automatically on health regression.
8. Roll back application image when compatible; use forward-fix/restore for irreversible schema changes.
9. Record deployment status and release digest. Never send institution records to the control plane.

Automatic does not mean unreviewed or simultaneous. Destructive migrations require explicit release approval and tested recovery.

## Not yet automated

This repository slice records provisioning and rollout requests. It does not yet create cloud accounts, networks, databases, DNS records, certificates, backups, or remote deployments. Provider-specific Terraform modules and a signed deployment worker with customer-authorized identities are required before advertising one-click provisioning.

Support grant approval is metadata only. Do not grant a support engineer access until the data-plane has implemented scoped session issuance, institution-side approval, session expiry/revocation and immutable audit logging.

## Production gate

Before production:
- replace the bootstrap bearer token with OIDC/SSO, MFA and role-based operator authorization;
- use a dedicated migrated PostgreSQL control database (AUTO_CREATE_SCHEMA=false);
- move all secrets into a secret manager;
- rate-limit and network-restrict the admin API;
- configure immutable audit retention and alerting;
- verify signed image attestations at deploy time;
- complete external penetration test, privacy review and disaster-recovery exercise;
- make the source repository private before placing proprietary code there.
