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

## Quality

```bash
just ci         # format:check, lint, typecheck, unit/core tests
just e2e        # migrate + seed + Playwright (needs the database)
```

## Run with Docker

```bash
just up         # db -> one-shot `migrate` service -> app on http://localhost:8080
```

`docker-compose.yml` runs migrations as a separate `migrate` service; the app only starts after it completed successfully.
