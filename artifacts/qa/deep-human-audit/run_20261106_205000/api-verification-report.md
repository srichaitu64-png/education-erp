# Backend API Verification & Routing Catalog

**Total Discovered Backend Endpoints:** 99  
**FastAPI Core Version:** 0.115+ with Pydantic v2  

| Domain Router | Primary Endpoints | Authentication | RBAC Guard | RLS Enforcement |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth` | `/login`, `/me`, `/refresh`, `/mfa/*`, `/password/*` | Public / Bearer | Multi-Role | Session Context |
| `/api/v1/academic` | `/students`, `/sections`, `/curriculum`, `/hall-tickets` | Bearer JWT | Role Permissions | RLS (tenant_id) |
| `/api/v1/attendance` | `/daily/mark`, `/periods/mark`, `/dashboard`, `/config` | Bearer JWT | Faculty / Admin | RLS (tenant_id) |
| `/api/v1/examinations` | `/examinations`, `/marks`, `/workflow/approval` | Bearer JWT | Multi-Stage Seal | RLS (tenant_id) |
| `/api/v1/finance` | `/structures`, `/invoices`, `/collect`, `/receipts` | Bearer JWT | Accountant / Admin | RLS (tenant_id) |
| `/api/v1/platform` | `/tenants`, `/plans`, `/permissions`, `/metrics` | Bearer JWT | SUPER_ADMIN Only | Global Tenancy |
| `/api/v1/migration` | `/templates`, `/validate`, `/batches`, `/execute` | Bearer JWT | Operator / Admin | RLS (tenant_id) |
