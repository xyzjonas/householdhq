# Household HQ

Household budget & finance dashboard. SvelteKit 3 (+ PWA manifest), Skeleton UI on Tailwind 4, Prisma 7 on MySQL.

## Layout

- `src/lib/server/core/` – **the core layer**: the only code that touches Prisma. Exposes repositories via `createCore(db)`. Pages, form actions and API routes use `hq(locals)` from `src/lib/server` for household data and `getCore()` for the global parts (users, sessions, households). ESLint forbids importing `@prisma/*` anywhere else.
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

### Households (multitenancy)

All data (accounts, categories, tags, transactions, vehicles, meters, settings, ...) belongs to exactly one **household**; a user can be a member of zero, one or many and works in one at a time (the switcher in the header only appears with more than one). Isolation is enforced in the core layer, not in pages: `core.forHousehold(id)` returns repositories on a Prisma client that pins every query to that household (`core/scope.ts`), references to other rows are checked to be in the same household (`core/refs.ts`), and `locals.hq` is only set for a household the user is a member of (re-checked on every request). A new table is household-scoped by default; `isolation.spec.ts` fails if it has no `householdId`. The first user is the instance administrator and manages households, users and memberships under `/admin`. Upgrading an existing installation turns its data into the household "Home".

Auth is email + password (scrypt) with server-side sessions: a random token in an `httpOnly`, `SameSite=Lax` cookie, only its sha256 stored in the `session` table, 30-day sliding expiry. `just seed` creates a dev admin `admin@example.com` / `password123` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) plus sample data.

## Quality

```bash
just ci         # format:check, lint, typecheck, unit/core tests
just e2e        # migrate + seed + Playwright (needs the database)
```

## Localization

English (base) and Czech. Translators edit `messages/<locale>.json`; see [docs/localization.md](docs/localization.md).

## Run with Docker

```bash
just up         # db -> one-shot `migrate` service -> app on http://localhost:8080
```

The runtime image is distroless (no shell, non-root; read-only rootfs in compose) and is published as `scotch3840/householdhq-v2` with `just docker`. Migrations ship as a separate image, `scotch3840/householdhq-v2-migrate` (runs `prisma migrate deploy`); use it for the one-shot migrate service in your deployment, not the app image.

The container entrypoint is `server.js` (wraps adapter-node so plain-http deployments pass SvelteKit's CSRF check; behind a TLS proxy that sends `x-forwarded-proto` nothing changes, otherwise set `PUBLIC_SCHEME=https`).

`docker-compose.yml` runs migrations as a separate `migrate` service; the app only starts after it completed successfully.
