.PHONY: setup env pull up down restart logs

setup: env pull

env:
	@python scripts/setup_env.py

pull:
	@echo "Pulling latest images..."
	docker compose pull

up:
	@echo "Starting containers..."
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

start: env pull up