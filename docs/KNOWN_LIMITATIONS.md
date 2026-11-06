# Known Limitations & Architecture Thresholds — EducationOS SaaS

**Version:** 1.0.0-rc1  
**Target Environment:** Multi-Tenant Cloud / On-Premise Hybrid  

---

## 1. System Capacity Thresholds

| Metric / Dimension | Supported Operational Threshold | Recommended Scaling Strategy |
| :--- | :--- | :--- |
| **Max Students per Institution** | 50,000 active students | Partition high-traffic tables (`daily_attendance_records`, `exam_marks`) by academic year or tenant ID. |
| **Max Campuses per Institution** | 50 campuses | Enterprise Plan with dedicated database read replicas. |
| **Concurrent Uvicorn Workers** | 4 to 16 workers per VM | Scale horizontally behind an OCI Load Balancer or Caddy cluster. |
| **PostgreSQL Connection Pool** | 15 pool size + 20 overflow per node | Deploy PgBouncer in transaction pooling mode for > 500 concurrent connections. |
| **Batch CSV Migration Ingestion** | 5,000 student rows per chunk | Larger datasets must use asynchronous chunked background worker queue. |

---

## 2. Technical Limitations & Trade-Offs

### A. Offline Sync Conflict Strategy
* **Current Behavior:** The offline sync engine (`offline_sync_queue`) uses a **last-write-wins (LWW)** with approved-record protection strategy. Once examination marks or fee receipts have been formally approved by an institution principal, offline sync submissions cannot silently overwrite the approved record.
* **Limitation:** Concurrent offline mark edits from two teachers on the same student before approval will take the latest timestamped change.

### B. Biometric Device Integration
* **Current Behavior:** Attendance supports REST-based webhook ingestion from biometric devices (`/api/v1/attendance/biometric/sync`).
* **Limitation:** Requires local on-premise attendance hardware to push HTTP requests to the cloud endpoint. Direct TCP socket device communication requires an on-premise bridge agent.

### C. File Attachments & Document Storage
* **Current Behavior:** Supports S3/MinIO compatible object storage for fee receipts, student avatars, and documents.
* **Limitation:** In local development without MinIO running, uploaded documents fallback to local filesystem storage under `apps/api/uploads/`. Production deployments must specify `S3_ENDPOINT`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY`.

---

## 3. Engineering Roadmap

1. **Phase 2 (Q1 2027):**
   * Native iOS and Android Flutter SDK wrappers with biometric biometric unlock.
   * Multi-region active-active read replicas for international schools.
2. **Phase 3 (Q2 2027):**
   * Automated WhatsApp Business API integration for fee receipt delivery.
   * AI-driven student risk identification and performance forecasting.
