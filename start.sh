#!/usr/bin/env bash
# ==============================================================================
# Enterprise Multi-Tenant Education ERP - Unified Single-Shot Launcher
# Starts Database (port 5433), FastAPI Backend (port 8000), and React Web (port 5173)
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    Enterprise Multi-Tenant Education ERP - Commercial SaaS Platform            "
echo "================================================================================"
echo -e "${NC}"

# 1. Check & Start PostgreSQL 16 cluster on port 5433
echo -e "${BLUE}[1/3] Checking PostgreSQL 16 Database Cluster (port 5433)...${NC}"
if ! nc -z 127.0.0.1 5433 2>/dev/null; then
  echo -e "${YELLOW}Starting local PostgreSQL 16 instance...${NC}"
  ./infrastructure/scripts/dev-db.sh start
else
  echo -e "${GREEN}✓ PostgreSQL 16 is already active on port 5433.${NC}"
fi

# 2. Check virtual environment & dependencies
if [ ! -d "apps/api/.venv" ]; then
  echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
  cd apps/api && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd "${SCRIPT_DIR}"
fi

if [ ! -d "apps/web/node_modules" ]; then
  echo -e "${YELLOW}Installing frontend node_modules...${NC}"
  cd apps/web && npm install && cd "${SCRIPT_DIR}"
fi

# Cleanup handler for graceful shutdown
API_PID=""
WEB_PID=""

cleanup() {
  echo -e "\n${YELLOW}Shutting down Education ERP services...${NC}"
  if [ -n "${API_PID}" ] && kill -0 "${API_PID}" 2>/dev/null; then
    kill "${API_PID}" 2>/dev/null || true
  fi
  if [ -n "${WEB_PID}" ] && kill -0 "${WEB_PID}" 2>/dev/null; then
    kill "${WEB_PID}" 2>/dev/null || true
  fi
  # Kill any stray processes on 8000 or 5173 started by this script
  fuser -k 8000/tcp 2>/dev/null || true
  fuser -k 5173/tcp 2>/dev/null || true
  echo -e "${GREEN}All services stopped cleanly.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Free ports if previously held
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# 3. Start FastAPI Backend Server
echo -e "${BLUE}[2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...${NC}"
cd "${SCRIPT_DIR}/apps/api"
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
API_PID=$!
cd "${SCRIPT_DIR}"

# Wait for backend health check
echo -n "Waiting for backend API to initialize"
for i in {1..30}; do
  if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
    echo -e " ${GREEN}✓ Backend Ready!${NC}"
    break
  fi
  echo -n "."
  sleep 0.5
done

# 4. Start Vite React Frontend Server
echo -e "${BLUE}[3/3] Starting Vite React Frontend on http://localhost:5173 ...${NC}"
cd "${SCRIPT_DIR}/apps/web"
npx vite --host 0.0.0.0 --port 5173 &
WEB_PID=$!
cd "${SCRIPT_DIR}"

sleep 2

echo -e "\n${GREEN}${BOLD}================================================================================${NC}"
echo -e "${GREEN}${BOLD}  🎉 EDUCATION ERP SAAS PLATFORM IS RUNNING!                                    ${NC}"
echo -e "${GREEN}${BOLD}================================================================================${NC}"
echo -e "${BOLD}🌐 APPLICATION URLS:${NC}"
echo -e "   • Public Marketing Portal : ${CYAN}http://localhost:5173/${NC}"
echo -e "   • Interactive Demo Sandbox: ${CYAN}http://localhost:5173/demo${NC}"
echo -e "   • Institution / Admin Sign: ${CYAN}http://localhost:5173/login${NC}"
echo -e "   • Backend API Swagger Docs: ${CYAN}http://127.0.0.1:8000/docs${NC}"
echo -e "   • System Health Check     : ${CYAN}http://127.0.0.1:8000/health${NC}"
echo ""
echo -e "${BOLD}🔐 SEEDED LOGIN CREDENTIALS:${NC}"
echo -e "   ${YELLOW}1. Platform Super Administrator:${NC}"
echo -e "      • Email        : ${BOLD}admin@platform.erp.in${NC}"
echo -e "      • Password     : ${BOLD}AdminSecurePassword2026!${NC}"
echo -e "      • School Code  : (Leave empty)"
echo -e "      • Access Level : Global Multi-Tenant Control, Entitlement Overrides, Plans"
echo ""
echo -e "   ${YELLOW}2. Pilot Institution Administrator (Akshara Global School & College):${NC}"
echo -e "      • Email        : ${BOLD}principal@akshara.edu.in${NC}"
echo -e "      • Password     : ${BOLD}PrincipalSecurePassword2026!${NC}"
echo -e "      • School Code  : ${BOLD}akshara${NC}"
echo -e "      • Access Level : Institution Principal Dashboard, Students, Fees, Attendance"
echo ""
echo -e "   ${YELLOW}3. Interactive Demo Sandbox (Zero-Friction):${NC}"
echo -e "      • URL          : ${CYAN}http://localhost:5173/demo${NC}"
echo -e "      • Access       : Pre-loaded with live student database, fee receipts, report cards"
echo -e "${GREEN}${BOLD}================================================================================${NC}"
echo -e "Press ${BOLD}Ctrl+C${NC} anytime to stop both frontend and backend."

# Keep script running while child processes are active
wait "${API_PID}" "${WEB_PID}"
