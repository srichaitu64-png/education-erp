# Enterprise Deployment & Infrastructure Guide — EducationOS SaaS

**Frontend Platform:** Vercel / Edge CDN  
**Backend Compute:** Oracle Cloud Infrastructure (OCI) Ampere / x86 Compute  
**Database:** Managed PostgreSQL 16 on OCI or Private VM with Block Volume  
**Reverse Proxy & TLS:** Caddy / Nginx with Automated Let's Encrypt TLS  

---

## 1. System Topology Overview

```
                      +-----------------------------+
                      |   Cloudflare / DNS Registry  |
                      |   *.erp.domain.com          |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    +--------------------+                       +--------------------+
    |  Vercel Edge CDN   |                       |  OCI Reverse Proxy |
    |  (React Vite SPA)  |                       |  (Caddy / Nginx)   |
    +--------------------+                       +---------+----------+
                                                           |
                                                           v
                                                 +--------------------+
                                                 | FastAPI API Backend|
                                                 | (Uvicorn Workers)  |
                                                 +---------+----------+
                                                           |
                                                           v
                                                 +--------------------+
                                                 | PostgreSQL 16      |
                                                 | (RLS Enforced)     |
                                                 +--------------------+
```

---

## 2. Environment Variables Specification

### Backend Variables (`apps/api/.env`)

| Variable Name | Environment | Sample Value | Security Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | All | `production` / `staging` / `development` | Dictates strict validation rules, CORS, and logging verbosity. |
| `SECRET_KEY` | All | `a8f5c3...64chars` | Cryptographic secret for signing JWTs. Must be minimum 32 characters. |
| `DATABASE_URL` | Production | `postgresql+asyncpg://erp_app:PASS@db.internal:5432/education_erp_prod` | Restricted application connection. Must use `erp_app`. |
| `SYNC_DATABASE_URL` | Production | `postgresql+psycopg2://erp_app:PASS@db.internal:5432/education_erp_prod` | Synchronous driver URL for background tools. |
| `TEST_ADMIN_DATABASE_URL` | Testing | `postgresql+asyncpg://erp_test_admin:PASS@127.0.0.1:5433/education_erp_test` | Dedicated disposable test administrator role. |
| `BASE_DOMAIN` | Production | `erp.educationos.com` | Root domain for multi-tenant institutional subdomain routing. |
| `SUPERADMIN_SUBDOMAIN` | Production | `admin` | Subdomain for platform control plane (`admin.erp.educationos.com`). |
| `CORS_ORIGINS` | Production | `https://admin.erp.educationos.com,https://*.erp.educationos.com` | Comma-delimited list of permitted CORS web origins. |
| `INITIAL_SUPERADMIN_PASSWORD` | First-run | High-entropy string | Used only on first seed to provision the platform owner. |

### Frontend Variables (`apps/web/.env.production`)

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.erp.educationos.com` | Backend REST API endpoint. |
| `VITE_BASE_DOMAIN` | `erp.educationos.com` | Base domain for tenant routing. |

---

## 3. Vercel Frontend Deployment

1. **Repository Linking:** Link GitHub repository `srichaitu64-png/education-erp` to Vercel.
2. **Project Settings:**
   * **Root Directory:** `apps/web`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
3. **Environment Variables:** Configure `VITE_API_BASE_URL` and `VITE_BASE_DOMAIN` under Vercel Project Settings.
4. **Wildcard Domain Routing:** Add `*.erp.educationos.com` to Vercel Domains to route all institutional subdomains to the same SPA.

---

## 4. OCI Backend Compute Deployment

### Step 1: Provision OCI Compute Instance
* **Image:** Ubuntu 22.04 LTS or 24.04 LTS (AArch64 Ampere A1 4 OCPU, 24 GB RAM recommended).
* **Security List:** Open TCP port 80 and 443 (HTTP/HTTPS) and TCP 22 (SSH). Restrict database port 5432 to the private subnet (VCN).

### Step 2: System Service Setup (systemd)
Create `/etc/systemd/system/education-erp-api.service`:
```ini
[Unit]
Description=EducationOS FastAPI Application
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/education-erp/apps/api
ExecStart=/opt/education-erp/apps/api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5
EnvironmentFile=/opt/education-erp/apps/api/.env

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now education-erp-api
```

### Step 3: Automated Reverse Proxy & SSL (Caddy)
Configure `/etc/caddy/Caddyfile`:
```caddyfile
api.erp.educationos.com {
    reverse_proxy 127.0.0.1:8000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```
Reload Caddy:
```bash
sudo systemctl reload caddy
```
