#!/usr/bin/env bash
# ==============================================================================
# Development PostgreSQL 16 Cluster Management Script
# Allows running native PostgreSQL without root/sudo privileges on custom port
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PG_DATA="${PROJECT_ROOT}/infrastructure/postgres_data"
PG_SOCKET="${PROJECT_ROOT}/infrastructure/postgres_socket"
PG_LOG="${PROJECT_ROOT}/infrastructure/postgres.log"
PG_BIN_DIR="/usr/lib/postgresql/16/bin"
PG_PORT="${PGPORT:-5433}"
PG_USER="${PGUSER:-postgres}"

mkdir -p "${PROJECT_ROOT}/infrastructure"

case "${1:-status}" in
  init)
    if [ -d "${PG_DATA}" ] && [ "$(ls -A "${PG_DATA}")" ]; then
      echo "PostgreSQL data directory already exists at ${PG_DATA}."
      exit 0
    fi
    echo "Initializing PostgreSQL 16 cluster in ${PG_DATA}..."
    mkdir -p "${PG_DATA}"
    chmod 700 "${PG_DATA}"
    "${PG_BIN_DIR}/initdb" -D "${PG_DATA}" --auth=trust -U "${PG_USER}"
    
    # Configure postgresql.conf for local development
    cat >> "${PG_DATA}/postgresql.conf" <<EOF
port = ${PG_PORT}
unix_socket_directories = '/tmp'
listen_addresses = '127.0.0.1'
max_connections = 100
shared_buffers = 128MB
EOF
    echo "PostgreSQL cluster initialized."
    ;;

  start)
    if [ ! -d "${PG_DATA}" ] || [ ! -f "${PG_DATA}/PG_VERSION" ]; then
      echo "Data directory not found. Initializing first..."
      "$0" init
    fi
    # Ensure unix_socket_directories is /tmp to avoid space in path issues
    sed -i "s|unix_socket_directories = .*|unix_socket_directories = '/tmp'|" "${PG_DATA}/postgresql.conf" || true
    echo "Starting PostgreSQL on port ${PG_PORT}..."
    "${PG_BIN_DIR}/pg_ctl" -D "${PG_DATA}" -l "${PG_LOG}" start
    sleep 2
    
    # Ensure databases exist
    "${PG_BIN_DIR}/psql" -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'education_erp_dev'" | grep -q 1 || \
      "${PG_BIN_DIR}/createdb" -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" education_erp_dev
    "${PG_BIN_DIR}/psql" -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'education_erp_test'" | grep -q 1 || \
      "${PG_BIN_DIR}/createdb" -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" education_erp_test
    echo "PostgreSQL running and databases (education_erp_dev, education_erp_test) ready."
    ;;

  stop)
    echo "Stopping PostgreSQL..."
    "${PG_BIN_DIR}/pg_ctl" -D "${PG_DATA}" stop -m fast || true
    ;;

  status)
    "${PG_BIN_DIR}/pg_ctl" -D "${PG_DATA}" status || true
    ;;

  psql)
    shift
    "${PG_BIN_DIR}/psql" -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" -d "${1:-education_erp_dev}"
    ;;

  *)
    echo "Usage: $0 {init|start|stop|status|psql [dbname]}"
    exit 1
    ;;
esac
