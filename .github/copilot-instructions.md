# AI coding guidelines for waelio-api

## High-level architecture

- Backend is a Nitro (`nitropack`) TypeScript API deployed to Netlify; entrypoints live under `routes/` and `routes/api/` (see `nitro.config.ts`, `netlify.toml`).
- There is a small Vue 3 + Vite UI in `frontend/` that hits the same API (see `frontend/src/App.vue`) and a static landing page in `public/index.html`.
- Quran and holy names data is served from JSON under `data/` (and duplicated under `shared/data/` for legacy use). The runtime API uses the top-level `data/` folder (see `routes/api/quran.ts`, `routes/api/holynames.ts`).
- Some routes exist in both `routes/**` and `src/routes/**`; treat `routes/**` as the primary runtime source and keep `src/routes/**` in sync only when touching existing endpoints.

## Backend route patterns

- New HTTP endpoints should be implemented as Nitro/H3 handlers using `defineEventHandler` in `routes/api/<name>.ts` (or `.get.ts`), mirroring the style in `routes/api/health.get.ts` and `routes/api/quran.ts`.
- Read query parameters with `getQuery(event)` and handle both string and array values, following `routes/api/quran.ts` (e.g. `const s = params?.s; const id = Number(Array.isArray(s) ? s[0] : s)`).
- For public JSON APIs that may be called cross-origin, apply CORS using `handleCors(event, { origin: '*' })` and early-return if it handles the response, as in `routes/api/holynames.ts`.
- When serving data, prefer shaping responses using the types in `shared/types/index.ts` (e.g. `QDBI`, `aya_interface`) and then cast with `as unknown as QDBI` as the existing endpoints do.

## API contracts that tests depend on

- `/api/health` must return JSON with `status: 'healthy'` and an ISO timestamp string (see `routes/api/health.get.ts`, `tests/e2e/health.spec.ts`). Do not change these field names or types.
- `/api/holynames` returns an array from `data/gnames.json` and supports `?name=` substring filtering (see `routes/api/holynames.ts`, `tests/e2e/holynames.spec.ts`).
- `/api/quran` returns an array of chapters (or a single chapter when `?s=<id>` is provided) shaped like `QDBI` (see `routes/api/quran.ts`, `tests/e2e/quran.spec.ts`). Preserve these shapes when refactoring.
- `/api/_openapi` serves a static OpenAPI 3.1 spec used by Swagger UI at `/openapi.html` and by tests (`tests/e2e/openapi.spec.ts`). If you add routes, update both the handler in `routes/api/_openapi.get.ts` and, if needed, the frontend docs links.

## Frontend and docs integration

- The landing page at `/` is served from `public/index.html` (plus Nitro `routes/index.ts`), exposes quick links to the main API endpoints, and calls `/api/health` via `fetch`. Keep this page working when changing URLs.
- The Vue app in `frontend/` is an optional UI shell that also calls `/api/health`, `/api/holynames`, and `/api/quran` and embeds the OpenAPI docs via an `<iframe src="/openapi.html">` (see `frontend/src/App.vue`). When changing API paths, update both this app and `public/index.html`.
- Both `public/index.html` and `public/openapi.html` implement a theme toggle by writing a `data-theme` attribute on `document.documentElement`. Reuse this pattern for any new static UI rather than inventing another.

## Local development & tests

- Use `pnpm` (not `npm`/`yarn`). The root scripts are:
  - `pnpm dev` – run Nitro dev server at `http://localhost:3000`.
  - `pnpm build` – build the Netlify-ready Nitro output.
  - `pnpm start` / `pnpm preview` – run the built server from `.output`.
  - `pnpm test:e2e` – Playwright e2e tests; this will auto-start `pnpm dev` using `playwright.config.ts`.
- For the Vue app inside `frontend/`, run its own scripts from that directory (`pnpm dev`, `pnpm build`, `pnpm preview`); it serves on port `4173` by default (see `frontend/vite.config.ts`).

## Conventions and gotchas

- This repo is ESM-first (`"type": "module"`, `moduleResolution: "bundler"`); always use `import`/`export` and avoid CommonJS helpers.
- When touching legacy code under `src/routes/**`, keep behavior aligned with the corresponding files in `routes/**` or clearly comment if it diverges.
- Static assets and HTML go in `public/`; anything under `public/` is served as-is by Netlify alongside the Nitro functions output.
- Before pushing significant changes, run `pnpm test:e2e` to ensure existing endpoint contracts remain intact.
