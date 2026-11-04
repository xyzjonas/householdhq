FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# --- full dependency install (dev deps included) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# --- build the SvelteKit app ---
FROM deps AS build
COPY . .
RUN npm run build

# --- migrations: one-shot `prisma migrate deploy` ---
FROM deps AS migrate
ENV NODE_ENV=production
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

# --- runtime: production deps + built output only ---
FROM base AS runtime
ENV NODE_ENV=production PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/build ./build
USER node
EXPOSE 3000
CMD ["node", "build"]
