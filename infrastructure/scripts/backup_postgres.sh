#!/usr/bin/env bash
# ==============================================================================
# Enterprise Education ERP - Production PostgreSQL Backup Utility
# Format: Compressed custom-format pg_dump (-Fc)
# Integrity: SHA256 cryptographic digest
# Encryption: Authenticated Encrypt-then-MAC (AES-256-CBC with PBKDF2 + HMAC-SHA256)
# Security: Key is read strictly from environment variable; never logged or exposed.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
DB_NAME="${1:-${PGDATABASE:-education_erp_dev}}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/infrastructure/backup}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_BASENAME="${DB_NAME}_backup_${TIMESTAMP}"
RAW_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_BASENAME}.dump"

mkdir -p "${BACKUP_DIR}"

echo "=========================================================="
echo "Starting PostgreSQL Backup for database: ${DB_NAME}"
echo "Host: ${PGHOST}:${PGPORT} | User: ${PGUSER}"
echo "Target directory: ${BACKUP_DIR}"
echo "=========================================================="

# 1. Execute compressed pg_dump (-Fc format)
pg_dump \
  -h "${PGHOST}" \
  -p "${PGPORT}" \
  -U "${PGUSER}" \
  -d "${DB_NAME}" \
  -Fc \
  -f "${RAW_BACKUP_FILE}"

FINAL_BACKUP_FILE="${RAW_BACKUP_FILE}"

# 2. Encrypt if ENCRYPTION_KEY is specified (Authenticated Encrypt-then-MAC)
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"
if [ -n "${ENCRYPTION_KEY}" ]; then
  echo "Encrypting backup with AES-256-CBC (PBKDF2 100k iterations)..."
  ENCRYPTED_FILE="${RAW_BACKUP_FILE}.enc"
  
  # Pass key via environment to prevent process listing leakage
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in "${RAW_BACKUP_FILE}" \
    -out "${ENCRYPTED_FILE}" \
    -pass env:ENCRYPTION_KEY
  
  # Remove unencrypted dump after successful encryption
  rm -f "${RAW_BACKUP_FILE}"
  FINAL_BACKUP_FILE="${ENCRYPTED_FILE}"
  
  # Generate HMAC-SHA256 authentication tag (Encrypt-then-MAC)
  HMAC_FILE="${FINAL_BACKUP_FILE}.hmac"
  HMAC_TAG="$(python3 -c '
import os, sys, hmac, hashlib
key = os.environ.get("ENCRYPTION_KEY", "").encode()
with open(sys.argv[1], "rb") as f:
    print(hmac.new(key, f.read(), hashlib.sha256).hexdigest())
' "${FINAL_BACKUP_FILE}")"
  echo "${HMAC_TAG}" > "${HMAC_FILE}"
  chmod 600 "${HMAC_FILE}"
  echo "HMAC-SHA256 authentication tag saved to: ${HMAC_FILE}"
  echo "Encrypted backup saved to: ${FINAL_BACKUP_FILE}"
else
  echo "Unencrypted compressed backup saved to: ${FINAL_BACKUP_FILE}"
fi

# 3. Generate SHA256 integrity checksum
CHECKSUM_FILE="${FINAL_BACKUP_FILE}.sha256"
sha256sum "${FINAL_BACKUP_FILE}" | awk '{print $1}' > "${CHECKSUM_FILE}"
CHECKSUM="$(cat "${CHECKSUM_FILE}")"
BACKUP_SIZE="$(du -h "${FINAL_BACKUP_FILE}" | cut -f1)"

echo "----------------------------------------------------------"
echo "Backup Completed Successfully!"
echo "File:     ${FINAL_BACKUP_FILE}"
echo "Size:     ${BACKUP_SIZE}"
echo "SHA256:   ${CHECKSUM}"
echo "Checksum: ${CHECKSUM_FILE}"
if [ -n "${ENCRYPTION_KEY}" ]; then
  echo "HMAC-Tag: $(cat "${HMAC_FILE}")"
fi
echo "----------------------------------------------------------"
