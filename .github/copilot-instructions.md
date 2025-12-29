# AI coding guidelines for waelio-api

## Overview

- Backend: Nitro (`nitropack`) TypeScript API targeting Netlify (`nitro.config.ts`, `netlify.toml`); runtime entrypoints live under `routes/` and `routes/api/`.
- UI: Vue 3 + Vite shell in `frontend/` that proxies to the API, plus static landing/docs pages in `public/`.
- Data: Quran and holy names JSON under `data/` (runtime source) with a mirrored legacy copy in `shared/data/`; keep them in sync only when modifying data.
- Duplicated routes exist under `src/routes/**`; treat `routes/**` as canonical and mirror changes only when editing existing endpoints there.

## Backend patterns

- Define endpoints with `defineEventHandler` in `routes/api/<name>.ts` or `.get.ts` (see `routes/api/health.get.ts`, `routes/api/quran.ts`).
- Query handling: use `getQuery(event)` and normalize string/array inputs like `const s = params?.s; const id = Number(Array.isArray(s) ? s[0] : s)` (see `routes/api/quran.ts`).
- CORS: for public JSON, call `handleCors(event, { origin: '*' })` and early-return when it handles the response (see `routes/api/holynames.ts`).
- Data shaping: rely on types in `shared/types/index.ts` (e.g., `QDBI`, `aya_interface`) and cast responses accordingly.

## Contracts enforced by tests

- `/api/health` → `{ status: 'healthy', timestamp: <ISO string> }` (`tests/e2e/health.spec.ts`).
- `/api/holynames` → array from `data/gnames.json`; supports `?name=` substring filter (`tests/e2e/holynames.spec.ts`).
- `/api/quran` → array of chapters (or single when `?s=<id>`), shaped like `QDBI` (`tests/e2e/quran.spec.ts`).
- `/api/_openapi` → serves static OpenAPI 3.1 spec consumed by `/openapi.html` and tests (`tests/e2e/openapi.spec.ts`); update handler and docs links when adding routes.

## Frontend & docs hooks

- Landing page at `/` comes from `public/index.html` (plus `routes/index.ts`); it fetches `/api/health` and links to main endpoints—keep URLs stable.
- Vue app (`frontend/src/App.vue`) calls the same APIs and embeds docs via `<iframe src="/openapi.html">`; update both the Vue app and `public/index.html` if endpoints move.
- Theme toggle pattern writes `data-theme` on `document.documentElement` in `public/index.html` and `public/openapi.html`; reuse this convention.

## Local dev & testing

- Use `pnpm` only. Key scripts:
  - `pnpm dev` runs both servers: Nitro API on `http://localhost:4000` (`dev:api`) and Vite UI on `http://localhost:3000` (`dev:ui`, proxies `/api` to 4000).
  - `pnpm build` builds the Netlify-ready output; `pnpm start` / `pnpm preview` run from `.output`.
  - `pnpm test:e2e` (or `pnpm test:e2e:ui`) runs Playwright; it autostarts `pnpm dev` and targets `http://localhost:3000` per `playwright.config.ts`.
- Frontend-only work: run scripts inside `frontend/`; Vite dev/previews also use port `3000`.

## Conventions & gotchas

- ESM-first (`"type": "module"`, `moduleResolution: "bundler"`); avoid CommonJS helpers.
- Static assets live in `public/`; served as-is by Netlify alongside Nitro functions.
- Keep `routes/**` and `src/routes/**` behaviors aligned when touching legacy copies; prefer editing only `routes/**` unless necessary.
- Run `pnpm test:e2e` before significant changes to avoid breaking contract tests.
