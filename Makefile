.PHONY: help install db-start db-stop db-status test build run-api run-web

help:
	@echo "Enterprise Multi-Tenant Education ERP - Development Commands"
	@echo "------------------------------------------------------------"
	@echo "make db-start    : Start local PostgreSQL 16 cluster on port 5433"
	@echo "make db-stop     : Stop local PostgreSQL 16 cluster"
	@echo "make db-status   : Check local PostgreSQL status"
	@echo "make test        : Run full automated pytest test suite"
	@echo "make run-api     : Start FastAPI backend server (port 8000)"
	@echo "make run-web     : Start Vite React frontend server (port 5173)"
	@echo "make build       : Build production web bundle"

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
