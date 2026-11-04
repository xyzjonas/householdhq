# Household HQ

Household budget & finance dashboard. SvelteKit 3 (+ PWA manifest), Skeleton UI on Tailwind 4, Prisma 7 on MySQL.

## Layout

- `src/lib/server/core/` – **the core layer**: the only code that touches Prisma. Exposes repositories (`accounts`, `categories`, `transactions`, `users`) via `createCore(db)`. Pages, form actions and future API routes use `getCore()` from `src/lib/server`. ESLint forbids importing `@prisma/*` anywhere else.
- `src/lib/components/` – UI built from Skeleton components/utilities.
- `prisma/` – schema + migrations (unchanged from the Nuxt version) and `seed.ts`.
- `e2e/` – Playwright tests.

## Develop

```bash
cp .env.example .env
just dev        # starts mysql (docker), applies migrations, runs vite
just seed       # optional sample data
```

## First run

On an empty database the app redirects everything to `/setup`, where you create the admin account (email + password); you are signed in right away. On startup it also creates the two default accounts when none exist: a **Bank account** (id 1) and **Expenses**, the outgoing account (id 2). Afterwards `/setup` is disabled and you use `/login`.

Auth is email + password (scrypt) with server-side sessions: a random token in an `httpOnly`, `SameSite=Lax` cookie, only its sha256 stored in the `session` table, 30-day sliding expiry. `just seed` creates a dev admin `admin@example.com` / `password123` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) plus sample data.

## Quality

```bash
just ci         # format:check, lint, typecheck, unit/core tests
just e2e        # migrate + seed + Playwright (needs the database)
```

## Run with Docker

```bash
just up         # db -> one-shot `migrate` service -> app on http://localhost:8080
```

The container entrypoint is `server.js` (wraps adapter-node so plain-http deployments pass SvelteKit's CSRF check; behind a TLS proxy that sends `x-forwarded-proto` nothing changes, otherwise set `PUBLIC_SCHEME=https`).

`docker-compose.yml` runs migrations as a separate `migrate` service; the app only starts after it completed successfully.
