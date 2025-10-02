dev:
  docker compose up -d db
  npm run dev

db:
  docker compose up -d db

db-restore:
  mysql -u root -p --host=localhost --port=3333 --protocol=tcp home < householdhq-dump-latest.sql 

migrate:
  npx prisma migrate dev

docker-build:
  docker build -t scotch3840/householdhq:latest .

docker: docker-build
  docker push scotch3840/householdhq:latest
