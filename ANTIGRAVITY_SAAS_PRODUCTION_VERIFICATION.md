# EDUCATIONOS — COMPLETE MULTI-TENANT SAAS PRODUCTION VERIFICATION

## ROLE

Act as a Principal SaaS Architect, Senior Security Engineer, Database Architect, DevOps Engineer, QA Lead and Enterprise ERP Auditor.

My main business objective is to launch EducationOS as a commercial multi-tenant SaaS ERP serving:

- K-12 schools
- Pre-University colleges
- Degree colleges
- Universities
- Multi-campus educational trusts

I am the EducationOS Platform Owner.

The uploaded/referenced architecture audit document describes the intended architecture. Verify every major claim against the actual repository, source code, database configuration, tests and deployment configuration.

IMPORTANT: Documentation is not implementation evidence. A test file is not proof that tests passed. A passing local test is not proof of production readiness.

## PHASE 0 — SAFETY AND BASELINE

Before any modification:

1. Inspect Git branch, HEAD, working-tree status and uncommitted changes.
2. Identify all modified and untracked files.
3. Preserve all existing work.
4. Create a dated backup of current tracked and untracked changes.
5. Never run git reset, git clean, destructive checkout or force operations.
6. Do not overwrite existing user changes.
7. Do not push, merge or deploy.
8. Do not execute production migrations or destructive production tests.
9. Do not install or use Playwright.

Produce a baseline report.

## PHASE 1 — VERIFY PLATFORM ROLE ARCHITECTURE

Verify actual implementation of:

- PLATFORM_OWNER
- SUPER_ADMIN
- BACKUP_SUPER_ADMIN
- PLATFORM_DEVELOPER
- PLATFORM_SUPPORT

Institution roles:

- CHAIRMAN_DIRECTOR
- PRINCIPAL
- VICE_PRINCIPAL
- INSTITUTION_ADMIN
- ACCOUNTANT
- EXAM_CONTROLLER
- TEACHER
- ADMISSION_OFFICER
- HR_MANAGER
- TRANSPORT_MANAGER
- PARENT
- STUDENT

For each role verify:

- Role identifier.
- Login and authentication.
- Database representation.
- Permission assignments.
- Route guards.
- Backend authorization.
- API permissions.
- Frontend navigation.
- Data visibility.
- Prohibited operations.

Ensure Platform Owner and institutional Chairman/Director are completely separate.

Verify that an institution administrator cannot create or promote an account to Platform Owner or Platform Super Admin.

Verify that developers have no default unrestricted access to institution records.

## PHASE 2 — PLATFORM OWNER PORTAL

Verify actual implementation of /platform/*.

Audit:

1. Platform dashboard.
2. Institution directory.
3. Institution creation.
4. Tenant provisioning.
5. Campus management.
6. Subscription plans.
7. Subscription lifecycle.
8. Billing and invoices.
9. Feature catalogue.
10. Tenant entitlements.
11. Platform user management.
12. Developer access management.
13. Support access requests.
14. Support approvals and expiry.
15. Support revocation.
16. Platform audit logs.
17. MRR and ARR calculations.
18. Platform analytics.
19. System health.
20. Platform configuration.

For every feature trace frontend → API → service → database.

Classify each as IMPLEMENTED, PARTIAL, MOCK, MISSING or BLOCKED.

## PHASE 3 — TENANT ISOLATION SECURITY AUDIT

Independently verify all five layers.

### API
- JWT tenant identity.
- Tenant context validation.
- Forged tenant header rejection.
- IDOR prevention.
- Cross-tenant request rejection.

### PostgreSQL
- RLS enabled.
- FORCE ROW LEVEL SECURITY where required.
- All tenant-owned tables identified.
- USING and WITH CHECK policies.
- Trusted transaction-scoped tenant context.
- Connection pool context reset.
- Privileged database roles reviewed.
- Background transaction safety.

### File storage
- Tenant-scoped storage paths.
- Signed URL expiry.
- Cross-tenant file access rejection.
- Upload and download authorization.

### Cache
- Tenant-prefixed keys.
- Cache invalidation.
- Cross-tenant cache isolation.

### Background jobs
- Explicit tenant context.
- Tenant context validation.
- Failure when tenant context is absent.
- Safe retries and idempotency.

Create a complete inventory of every tenant-owned table, not only the previously documented 16 tables.

Check related tables, junction tables, audit records, documents, exports, reports and background job data.

## PHASE 4 — AUTHENTICATION AND SECURITY

Audit:

- Argon2id password hashing.
- Password change.
- First-login mandatory password setup.
- Forgot password.
- Reset-token hashing.
- Reset-token expiry.
- Single-use token consumption.
- Account lockout.
- Login rate limiting.
- JWT expiry.
- Refresh-token rotation.
- Session revocation.
- Logout enforcement.
- MFA for privileged platform accounts.
- Session management.
- Security event logging.
- Password reset response leakage.
- Tenant membership validation during login.
- Privilege escalation.
- CSRF protection where applicable.
- CORS.
- Cookie security.
- Secrets management.

Pay special attention to the previously identified potential issues:

1. Tenant membership validation during tenant selection.
2. Raw password-reset token exposure.
3. Session revocation actually invalidating active tokens.
4. First-login password setup enforcement.
5. Administrator password-reset authorization.
6. Atomic password-reset token consumption.
7. Refresh-token rotation and revocation.

Determine whether each has been fixed in the current code.

Do not assume it is fixed merely because a new test exists.

## PHASE 5 — SUBSCRIPTION AND SAAS BILLING

Verify:

- Starter plan.
- Standard plan.
- Pro plan.
- Premium plan.
- Enterprise plan.
- Trial period.
- Trial expiry.
- Subscription activation.
- Renewal.
- Cancellation.
- Payment failure.
- Grace period.
- Suspension.
- Reactivation.
- Upgrade and downgrade.
- Plan limits.
- User limits.
- Student limits.
- Campus limits.
- Storage limits.
- Feature entitlements.
- Billing history.
- Invoice generation.
- GST readiness for India.

Verify that plan restrictions are enforced by the backend, not just hidden in the UI.

Never fabricate payment success.

## PHASE 6 — INSTITUTION CONFIGURATION

Verify institution types:

- School.
- PU college.
- Degree college.
- University.
- Multi-campus trust.

Verify configurable:

- Academic years.
- Campuses.
- Programmes.
- Courses.
- Classes.
- Sections.
- Departments.
- Timetables.
- Daily attendance.
- Optional period-wise attendance.
- Fee heads and structures.
- Examination patterns.
- Marks and grading policies.
- Optional modules.
- Institution branding.

One institution's settings must not affect another tenant.

## PHASE 7 — DATA MIGRATION ARCHITECTURE

Verify the central Data Migration Centre and module-level import entry points.

Modules:

- Students.
- Admissions.
- Fees.
- Examinations.
- Marks.
- Attendance.
- Staff.
- Other supported modules.

Verify one shared migration engine.

Test:

- CSV import.
- Excel import.
- Templates.
- Column mapping.
- Validation.
- Duplicate detection.
- Preview.
- Error handling.
- Update/skip/reject policies.
- Approval workflow.
- Transactional or resumable execution.
- Import history.
- Audit logs.
- Tenant isolation.
- Historical record preservation.

Never import payments as completed without verified evidence.

Never silently overwrite published examination results.

## PHASE 8 — INSTITUTION ERP

Audit the real institutional portal /app/*.

Review:

- Student management.
- Admissions.
- Attendance.
- Fees.
- Examinations.
- Marks.
- Report cards.
- Hall tickets.
- Timetable.
- Staff.
- HR and payroll.
- Transport.
- Parent portal.
- Student portal.
- Reports.
- Documents.
- Notifications.

Verify real data and backend operations.

## PHASE 9 — DEPLOYMENT AND OPERATIONS

Inspect:

- GitHub Actions.
- Vercel configuration.
- FastAPI hosting configuration.
- PostgreSQL production configuration.
- Database migrations.
- Environment variables.
- CORS.
- Domain configuration.
- HTTPS.
- Health checks.
- Logging.
- Error monitoring.
- Database backup.
- Restore procedures.
- Disaster recovery.
- Connection pooling.
- Rate limiting.
- Background workers.
- Storage.
- Production secrets.

Clearly distinguish frontend deployment from complete backend production deployment.

Do not assume Vercel frontend availability means the entire SaaS is live.

## PHASE 10 — INDEPENDENT TESTING

Run existing relevant tests where safe.

Add missing tests only after reviewing existing architecture.

Verify:

- Platform/institution role separation.
- Tenant A versus Tenant B.
- Cross-tenant IDOR.
- Tenant header tampering.
- RLS.
- Platform Developer restrictions.
- Support access lifecycle.
- Subscription entitlements.
- First-login enforcement.
- Password reset security.
- Session revocation.
- Institution onboarding.
- Module permissions.
- Migration integrity.
- Database constraints.

Record actual commands, exit codes, results and test counts.

Do not claim 56/56 or any other test count unless actually executed.

Do not use Playwright.

If browser verification is unavailable, mark it BLOCKED.

## PHASE 11 — REPORTS

Create:

AUDIT_REPORTS/01_BASELINE_AND_GIT_STATUS.md

AUDIT_REPORTS/02_PLATFORM_ROLE_AUDIT.md

AUDIT_REPORTS/03_PLATFORM_OWNER_PORTAL_AUDIT.md

AUDIT_REPORTS/04_TENANT_ISOLATION_AUDIT.md

AUDIT_REPORTS/05_AUTHENTICATION_SECURITY_AUDIT.md

AUDIT_REPORTS/06_SUBSCRIPTION_BILLING_AUDIT.md

AUDIT_REPORTS/07_INSTITUTION_CONFIGURATION_AUDIT.md

AUDIT_REPORTS/08_DATA_MIGRATION_AUDIT.md

AUDIT_REPORTS/09_INSTITUTION_ERP_AUDIT.md

AUDIT_REPORTS/10_DEPLOYMENT_OPERATIONS_AUDIT.md

AUDIT_REPORTS/11_AUTOMATED_TEST_RESULTS.md

AUDIT_REPORTS/12_FINAL_SAAS_READINESS_REPORT.md

For each finding provide:

- Finding ID.
- Severity: P0/P1/P2/P3.
- Evidence and exact file/line.
- Reproduction steps.
- Root cause.
- Business impact.
- Recommended correction.
- Test required.
- Status.

Use only:

PASS
FAIL
BLOCKED
NOT TESTED
PARTIAL

## PHASE 12 — CONTROLLED REMEDIATION PLAN

First complete the audit without changing production behaviour.

Present:

1. Confirmed implementation.
2. Missing implementation.
3. Security vulnerabilities.
4. Incorrect documentation claims.
5. Required database changes.
6. Required API changes.
7. Required UI changes.
8. Deployment blockers.
9. Prioritised remediation plan.

Do not automatically perform risky fixes.

Preserve all uncommitted work.

Wait for my approval before production migrations, destructive operations, Git pushes, merges or deployment.

## FINAL OBJECTIVE

Prove whether EducationOS is genuinely ready to operate as a secure commercial multi-tenant SaaS platform.

The Platform Owner must be able to manage multiple independent schools and colleges.

Each institution must manage its own users, campuses, academic workflows, subscriptions and data without cross-tenant leakage.

Produce evidence, not marketing claims.

A convincing architecture document is not proof of a working production SaaS application.
