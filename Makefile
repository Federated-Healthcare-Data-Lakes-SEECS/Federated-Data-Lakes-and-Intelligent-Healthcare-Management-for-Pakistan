.PHONY: up down restart logs ps db-push seed

# Build and start the full local environment (db, backend, microservices,
# audio mock, frontend, admin panel). Each backend container pushes the
# Prisma schema and hospital-backend seeds demo data on every startup.
up:
	docker compose up --build

# Same as `up`, but detached.
up-d:
	docker compose up --build -d

down:
	docker compose down

restart: down up-d

logs:
	docker compose logs -f

ps:
	docker compose ps

# Re-push the Prisma schema to the running database without restarting
# containers (useful after editing a schema.prisma file).
db-push:
	docker compose exec hospital-backend npx prisma db push --accept-data-loss
	docker compose exec checkups-microservice npx prisma db push --accept-data-loss
	docker compose exec labtests-microservice npx prisma db push --accept-data-loss

# Re-seed demo data (departments, staff, patients, checkups) without
# restarting the hospital-backend container.
seed:
	docker compose exec hospital-backend npm run seed
