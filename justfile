set dotenv-load := true

default:
  @just --list

# --- development ---------------------------------------------------------

# install dependencies and generate the prisma client
install:
  npm ci

# start the database and the dev server
dev: db migrate
  npm run dev

# --- database ------------------------------------------------------------

# start the local mysql (docker compose)
db:
  docker compose up -d --wait db

db-stop:
  docker compose stop db

# apply pending migrations
migrate:
  npx prisma migrate deploy

# create + apply a new migration from schema changes
makemigrations name:
  npx prisma migrate dev --name {{name}}

# insert development sample data (no-op when data exists)
seed:
  npm run db:seed

db-restore:
  mysql -u root -p --host=localhost --port=3333 --protocol=tcp home < householdhq-dump-latest.sql

generate:
  npx prisma generate

# --- quality -------------------------------------------------------------

format:
  npm run format

lint:
  npm run lint

check:
  npm run check

# unit + core integration tests (needs the database)
test:
  npm run test:unit

# end-to-end tests (needs a migrated + seeded database)
e2e: db migrate seed
  npm run db:seed:long
  npm run test:e2e

# everything CI runs, except e2e
ci:
  npm run format:check
  npm run lint
  npm run check
  npm run test:unit

# --- build & deploy ------------------------------------------------------

build:
  npm run build

image := "scotch3840/householdhq-v2"

# build the production image (tagged as `image` via docker-compose.yml)
docker-build:
  docker compose build app migrate

# run the full stack (db, one-shot migrations, app) on http://localhost:8080
up:
  docker compose up --build -d

down:
  docker compose down

logs:
  docker compose logs -f

# build the app + migrate images and push both to Docker Hub (latest + commit sha)
docker: docker-build
  for i in {{image}} {{image}}-migrate; do \
    docker tag $i:latest $i:$(git rev-parse --short HEAD); \
    docker push $i:latest; \
    docker push $i:$(git rev-parse --short HEAD); \
  done
