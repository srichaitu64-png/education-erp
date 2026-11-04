.PHONY: help install db-start db-stop db-status test build run-api run-web run dev start creds

help:
	@echo "Enterprise Multi-Tenant Education ERP - Development Commands"
	@echo "------------------------------------------------------------"
	@echo "make run / make dev  : ONE-SHOT start Database, Backend API & Frontend together"
	@echo "make creds           : Display all pre-seeded login credentials"
	@echo "make db-start        : Start local PostgreSQL 16 cluster on port 5433"
	@echo "make db-stop         : Stop local PostgreSQL 16 cluster"
	@echo "make db-status       : Check local PostgreSQL status"
	@echo "make test            : Run full automated pytest test suite"
	@echo "make run-api         : Start FastAPI backend server only (port 8000)"
	@echo "make run-web         : Start Vite React frontend server only (port 5173)"
	@echo "make build           : Build production web bundle"

run:
	@./start.sh

dev:
	@./start.sh

start:
	@./start.sh

creds:
	@echo "============================================================"
	@echo "   PRE-SEEDED LOGIN CREDENTIALS"
	@echo "============================================================"
	@echo "1. PLATFORM SUPER ADMINISTRATOR"
	@echo "   • Email       : admin@platform.erp.in"
	@echo "   • Password    : AdminSecurePassword2026!"
	@echo "   • School Code : (Leave blank)"
	@echo "   • Role        : Global Super Admin (/superadmin)"
	@echo ""
	@echo "2. PILOT INSTITUTION PRINCIPAL (Akshara Global School & College)"
	@echo "   • Email       : principal@akshara.edu.in"
	@echo "   • Password    : PrincipalSecurePassword2026!"
	@echo "   • School Code : akshara"
	@echo "   • Role        : Institution Admin (/dashboard)"
	@echo ""
	@echo "3. INTERACTIVE DEMO SANDBOX (No Login Required)"
	@echo "   • URL         : http://localhost:5173/demo"
	@echo "============================================================"

db-start:
	./infrastructure/scripts/dev-db.sh start

db-stop:
	./infrastructure/scripts/dev-db.sh stop

db-status:
	./infrastructure/scripts/dev-db.sh status

test:
	apps/api/.venv/bin/pytest tests/ -v

run-api:
	cd apps/api && .venv/bin/uvicorn app.main:app --reload --port 8000

run-web:
	cd apps/web && npm run dev

build:
	cd apps/web && npm run build


