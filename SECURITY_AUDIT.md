# EducationOS Enterprise – SaaS Security & Data Privacy Audit

**Security Standard:** Zero-Trust Multi-Tenant Architecture  
**Certification Alignment:** SOC 2 Type II, ISO/IEC 27001:2022  

---

## 1. Zero-Trust Access Control & Perimeter Isolation

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SECURITY PERIMETER MAP                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ LEVEL 1: SAAS PLATFORM ROOT       │ LEVEL 2: TENANT CAMPUSES           │
│ Endpoint: /platform/*             │ Endpoint: /app/*, /login           │
│ Portal: /platform/login           │ Portal: /login                     │
│ Auth: Root Cryptographic JWT      │ Auth: Tenant Cryptographic JWT     │
│ Guard: requireSuperAdmin = True   │ Guard: Scoped Role & Duty Matrix   │
│ Cross-Tenant Data: Consent Gated  │ Cross-Tenant Data: STRICTLY DENIED │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Mutual Authentication Barrier:**
   - Institutional accounts (`@akshara.edu.in`) attempting to access `/platform/*` or sign in via `/platform/login` are rejected immediately with `403 Forbidden` and logged as a security event.
   - Platform Owner accounts (`@platform.erp.in`) are barred from signing in on the institutional campus portal (`/login`).

2. **Platform Support Consent Gating (`PlatformSupportAccessSession`):**
   - Platform Super Admins do **NOT** have silent or continuous read access to private tenant data.
   - Access requires:
     1. Formal support request ticket.
     2. Explicit, cryptographic approval by the institution's Chairman or Institution Admin.
     3. Strict time-to-live (e.g. 1 hour).
     4. Complete audit trail recording every query executed.

---

## 2. Parent-Child Data Privacy & Anti-IDOR Protections

1. **Guaranteed Child Isolation:**
   - Every parent API endpoint validates the `guardian_id -> student_id` link stored in `students.student_guardians`.
   - Supplying another student's admission number or ID via query parameters or path variables returns `403 Forbidden`.
   - File downloads (Hall tickets, progress cards, fee receipts) require an authenticated, pre-signed token verifying guardian relationship.

2. **Hall Ticket Access Policies:**
   - **Mode A (Online Download Authorised):** Parent and student can view and download approved PDF.
   - **Mode B (Office Collection Only):** Displays collection hours and location. Direct PDF download is blocked at the API level.
   - **Mode C (Not Released):** Unpublished tickets return 404/403.

---

## 3. Cryptographic Storage & Session Standards

- **Passwords:** Argon2id with 64MB memory cost, 3 iterations, and unique 16-byte random salt.
- **Session Tokens:** Asymmetric Ed25519 or HMAC-SHA256 JWTs with 15-minute access token expiry and 7-day refresh token rotation.
- **Data in Transit:** TLS 1.3 enforced across all API endpoints with strict HSTS preload (`max-age=63072000`).
- **Data at Rest:** AES-256 transparent tablespace encryption on PostgreSQL storage volumes.
