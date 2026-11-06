# Backup & Disaster Recovery Runbook — EducationOS SaaS

**Target RPO (Recovery Point Objective):** <= 15 minutes  
**Target RTO (Recovery Time Objective):** <= 60 minutes  
**Backup Frequency:** Hourly WAL Archiving + Daily Full Database Snapshots  
**Retention Policy:** 30 days daily snapshots, 12 months monthly archives  

---

## 1. Backup Architecture & Storage Offsite Policy

EducationOS employs a dual-tier backup strategy:
1. **Continuous WAL Archiving (PITR):** Enables restoration to any arbitrary second within the last 14 days.
2. **Encrypted Nightly Snapshots:** Full consistent database dumps using `pg_dump` with gzip compression and GPG symmetric encryption, replicated to off-region OCI Object Storage.

---

## 2. Automated Daily Snapshot Script

Install the following script on the database server at `/usr/local/bin/erp-backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/education-erp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/erp_prod_${TIMESTAMP}.dump.gz.gpg"
DB_NAME="education_erp_prod"
DB_USER="postgres"
ENCRYPTION_PASSPHRASE_FILE="/etc/education-erp/backup_key.secret"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of database: ${DB_NAME}..."

# Execute consistent snapshot with pg_dump, gzip, and GPG encryption
pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v \
  | gzip -c \
  | gpg --batch --yes --passphrase-file "${ENCRYPTION_PASSPHRASE_FILE}" -c -o "${BACKUP_FILE}"

echo "[$(date)] Backup encrypted successfully: ${BACKUP_FILE}"

# Offload to OCI Object Storage / S3 bucket
if command -v oci >/dev/null 2>&1; then
    oci os object put --namespace-name "YOUR_NAMESPACE" --bucket-name "erp-backups" \
        --file "${BACKUP_FILE}" --name "daily/erp_prod_${TIMESTAMP}.dump.gz.gpg"
    echo "[$(date)] Offloaded to OCI Object Storage."
fi

# Clean local backups older than retention period
find "${BACKUP_DIR}" -name "erp_prod_*.dump.gz.gpg" -type f -mtime +"${RETENTION_DAYS}" -delete
echo "[$(date)] Local backup cleanup completed."
```

### Crontab Schedule
Add to `/etc/cron.d/erp-backup`:
```cron
# Run daily at 02:00 AM UTC
0 2 * * * root /usr/local/bin/erp-backup.sh >> /var/log/erp-backup.log 2>&1
```

---

## 3. Database Restoration & Recovery Drill

### Step-by-Step Restoration Procedure

1. **Retrieve and Decrypt Snapshot:**
   ```bash
   gpg --batch --passphrase-file /etc/education-erp/backup_key.secret \
       -d /var/backups/education-erp/erp_prod_20261106_020000.dump.gz.gpg \
       | gunzip -c > /tmp/restore_target.dump
   ```

2. **Prepare Target Database:**
   ```bash
   # Terminate existing active application connections
   psql -U postgres -d postgres -c "
       SELECT pg_terminate_backend(pid) 
       FROM pg_stat_activity 
       WHERE datname = 'education_erp_prod' AND pid <> pg_backend_pid();
   "
   # Drop and recreate empty database
   dropdb -U postgres education_erp_prod
   createdb -U postgres education_erp_prod
   ```

3. **Restore Data & Schema:**
   ```bash
   pg_restore -U postgres -d education_erp_prod -v /tmp/restore_target.dump
   rm -f /tmp/restore_target.dump
   ```

4. **Re-Enforce Permissions & RLS:**
   ```bash
   # Re-grant application privileges
   psql -U postgres -d education_erp_prod -c "
       GRANT USAGE ON SCHEMA public TO erp_app;
       GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO erp_app;
       GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO erp_app;
   "
   # Verify RLS policies are enabled
   python3 -c "
   import asyncio
   from app.database.session import engine
   from app.database.rls import enable_row_level_security
   async def main():
       async with engine.begin() as conn:
           await enable_row_level_security(conn)
   asyncio.run(main())
   "
   ```

5. **Post-Restore Health Check:**
   * Query total tenant count: `SELECT count(*) FROM tenants;`
   * Verify integrity of newest fee receipt and student enrollment.
   * Verify API returns HTTP 200 on `/api/v1/health`.

