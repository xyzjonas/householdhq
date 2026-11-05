# syntax=docker/dockerfile:1

# Build stages run on alpine; the final `runtime` stage is distroless (no shell,
# no package manager, runs as a non-root user). The app is pure JS (Prisma uses
# its WASM query compiler), so nothing native has to match between stages.
FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# --- full dependency install (dev deps included) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# --- build the SvelteKit app (also generates the prisma client) ---
FROM deps AS build
COPY . .
RUN npm run build

# --- production dependencies only ---
FROM base AS prod-deps
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
 && npm cache clean --force
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# --- migrations: one-shot `prisma migrate deploy` ---
FROM deps AS migrate
ENV NODE_ENV=production
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

# --- runtime: distroless nodejs, production deps + built output only ---
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
# root-owned and read-only for the (non-root) runtime user
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json server.js ./
USER nonroot
EXPOSE 3000
# distroless has no curl/wget: probe with node itself (any non-5xx response = alive)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000),{redirect:'manual'}).then(r=>process.exit(r.status<500?0:1),()=>process.exit(1))"]
CMD ["server.js"]
