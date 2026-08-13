.PHONY: help install run-backend run-ui run ingest test lint clean docker-build docker-up docker-down

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pip install -r requirements.txt

run-backend: ## Start the FastAPI backend server
	uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

run-ui: ## Start the Streamlit frontend
	streamlit run ui/app.py

run: ## Start both backend and frontend (backend in background)
	@echo "Starting backend..."
	uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload &
	@echo "Starting frontend..."
	streamlit run ui/app.py

ingest: ## Ingest documents from DATA/ directory
	python -m app.ingestion.processor DATA --wipe

ingest-append: ## Ingest documents without wiping existing data
	python -m app.ingestion.processor DATA

test: ## Run all tests
	pytest tests/ -v

lint: ## Run linting checks
	python -m py_compile app/main.py
	python -m py_compile app/agents/graph.py
	python -m py_compile app/agents/nodes/planner.py
	python -m py_compile app/agents/nodes/retriever.py
	python -m py_compile app/agents/nodes/responder.py

clean: ## Clean up generated files
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf processed_data/* 2>/dev/null || true

docker-build: ## Build Docker images
	docker compose build

docker-up: ## Start all services with Docker Compose
	docker compose up -d

docker-down: ## Stop all Docker services
	docker compose down
