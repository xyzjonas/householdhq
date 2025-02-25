db:
  docker compose up -d db

docker-build:
  docker build -t scotch3840/householdhq:latest .

docker: docker-build
  docker push scotch3840/householdhq:latest
