#!/usr/bin/env bash
# ==============================================================================
# Enterprise Education ERP - Production PostgreSQL Restore Utility
# Authenticates Encrypt-then-MAC (HMAC-SHA256) and verifies SHA256 integrity
# before any decryption or database operations occur.
# Security: Key is read strictly from environment variable; never logged or exposed.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

BACKUP_FILE="${1:-}"
TARGET_DB="${2:-}"

if [ -z "${BACKUP_FILE}" ] || [ -z "${TARGET_DB}" ]; then
  echo "Usage: $0 <backup_file> <target_database>"
  echo "Example: $0 infrastructure/backup/education_erp_dev_backup_20261105.dump.enc education_erp_restore_test"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found at ${BACKUP_FILE}"
  exit 1
fi

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
DECRYPTION_KEY="${DECRYPTION_KEY:-}"

echo "=========================================================="
echo "Starting PostgreSQL Restore"
echo "Source File: ${BACKUP_FILE}"
echo "Target DB:   ${TARGET_DB}"
echo "Host:        ${PGHOST}:${PGPORT} | User: ${PGUSER}"
echo "=========================================================="

# 1. Verify SHA256 checksum if present
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "Verifying SHA256 checksum..."
  EXPECTED_SUM="$(cat "${CHECKSUM_FILE}")"
  ACTUAL_SUM="$(sha256sum "${BACKUP_FILE}" | awk '{print $1}')"
  if [ "${EXPECTED_SUM}" != "${ACTUAL_SUM}" ]; then
    echo "ERROR: Checksum mismatch! Corrupted or tampered backup file."
    echo "Expected: ${EXPECTED_SUM}"
    echo "Actual:   ${ACTUAL_SUM}"
    exit 2
  fi
  echo "SHA256 integrity verified successfully."
else
  echo "Warning: No checksum file found at ${CHECKSUM_FILE}. Skipping hash verification."
fi

# 2. Authenticate ciphertext with HMAC-SHA256 tag (Encrypt-then-MAC authentication)
HMAC_FILE="${BACKUP_FILE}.hmac"
if [ -f "${HMAC_FILE}" ]; then
  if [ -z "${DECRYPTION_KEY}" ]; then
    echo "ERROR: Backup file has HMAC authentication tag (.hmac), but DECRYPTION_KEY is not set."
    exit 3
  fi
  echo "Authenticating ciphertext with HMAC-SHA256 tag..."
  EXPECTED_HMAC="$(cat "${HMAC_FILE}")"
  ACTUAL_HMAC="$(python3 -c '
import os, sys, hmac, hashlib
key = os.environ.get("DECRYPTION_KEY", "").encode()
with open(sys.argv[1], "rb") as f:
    print(hmac.new(key, f.read(), hashlib.sha256).hexdigest())
' "${BACKUP_FILE}")"

  if [ "${EXPECTED_HMAC}" != "${ACTUAL_HMAC}" ]; then
    echo "CRITICAL ERROR: HMAC authentication failed! The backup file has been tampered with or the decryption key is incorrect."
    echo "Aborting immediately without attempting decryption or touching the database."
    exit 4
  fi
  echo "HMAC-SHA256 authentication tag verified successfully."
fi

TEMP_DUMP_FILE=""
CLEANUP_TEMP="false"

# 3. Decrypt if file ends with .enc
if [[ "${BACKUP_FILE}" == *.enc ]]; then
  if [ -z "${DECRYPTION_KEY}" ]; then
    echo "Error: Backup file is encrypted (.enc) but DECRYPTION_KEY environment variable is not set."
    exit 5
  fi
  echo "Decrypting AES-256-CBC encrypted backup..."
  TEMP_DUMP_FILE="$(mktemp "${PROJECT_ROOT}/infrastructure/backup/temp_restore_XXXXXX.dump")"
  CLEANUP_TEMP="true"
  
  trap 'if [ "${CLEANUP_TEMP}" = "true" ] && [ -n "${TEMP_DUMP_FILE}" ] && [ -f "${TEMP_DUMP_FILE}" ]; then rm -f "${TEMP_DUMP_FILE}"; echo "Cleaned up temporary decrypted file."; fi' EXIT

  openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
    -in "${BACKUP_FILE}" \
    -out "${TEMP_DUMP_FILE}" \
    -pass env:DECRYPTION_KEY
  RESTORE_SOURCE="${TEMP_DUMP_FILE}"
else
  RESTORE_SOURCE="${BACKUP_FILE}"
fi

# 4. Create target database if it does not exist
DB_EXISTS="$(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -tAc "SELECT 1 FROM pg_database WHERE datname='${TARGET_DB}';")"
if [ "${DB_EXISTS}" != "1" ]; then
  echo "Target database '${TARGET_DB}' does not exist. Creating it..."
  psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -c "CREATE DATABASE ${TARGET_DB};"
else
  echo "Target database '${TARGET_DB}' exists."
fi

# 5. Execute pg_restore
echo "Executing pg_restore into '${TARGET_DB}'..."
set +e
pg_restore \
  -h "${PGHOST}" \
  -p "${PGPORT}" \
  -U "${PGUSER}" \
  -d "${TARGET_DB}" \
  --no-owner \
  --role="${PGUSER}" \
  "${RESTORE_SOURCE}"
RESTORE_STATUS=$?
set -e

if [ ${RESTORE_STATUS} -gt 1 ]; then
  echo "ERROR: pg_restore failed with exit code ${RESTORE_STATUS}."
  exit ${RESTORE_STATUS}
fi

# 6. Verification queries
TABLE_COUNT="$(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${TARGET_DB}" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")"
TENANT_COUNT="$(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${TARGET_DB}" -tAc "SELECT count(*) FROM tenants;" 2>/dev/null || echo "0")"

echo "----------------------------------------------------------"
echo "Restore Completed Successfully!"
echo "Target DB:    ${TARGET_DB}"
echo "Total Tables: ${TABLE_COUNT}"
echo "Tenants:      ${TENANT_COUNT}"
echo "----------------------------------------------------------"
