# AI coding guidelines for waelio-api

## What lives where
- Backend is Nitro (`nitropack`) targeting Netlify (`nitro.config.ts`, `netlify.toml`); canonical runtime entrypoints are in `routes/` (and `routes/api/`). Legacy mirrors sit in `src/routes/**`—touch only when syncing.
- UI is a minimal Vue 3 + Vite shell in `frontend/`; Vite dev runs on `3000` and proxies `/api`, `/openapi.html`, `/icons`, `/manifest.webmanifest`, `/sw.js` to the Nitro dev server on `4000` (`frontend/vite.config.ts`).
- Static landing/docs come from `public/` (e.g., `public/index.html`, `public/openapi.html`) and are also served by Netlify alongside functions.
- Data sources: Quran text and metadata under `data/` (authoritative) with a mirrored legacy copy in `shared/data/`; keep both in sync when editing data files.

## Backend patterns that matter
- Define handlers with `defineEventHandler` in `routes/api/<name>.ts` or `.get.ts` (see `routes/api/health.get.ts`, `routes/api/quran.ts`). Use `getQuery(event)` and normalize string/array inputs (e.g., `const idx = Number(Array.isArray(s) ? s[0] : s)`).
- Public JSON endpoints use permissive CORS (`handleCors(event, { origin: '*' })`) and must early-return if CORS responds (`routes/api/holynames.ts`). Auth endpoints instead whitelist origins `https://peace2074.com` (+ www) and set `credentials: true` via paired `.options.ts` handlers.
- Data shaping leans on types in `shared/types/index.ts` (`QDBI`, `aya_interface`); cast responses accordingly. `/api/quran` builds chapter objects from `data/editions/en.json` + `data/quran.json` and supports `?s=<id>` for single chapter.
- OpenAPI contract is served from `routes/api/_openapi.get.ts` and consumed by `public/openapi.html` plus tests; keep it updated whenever routes change.

## Auth specifics
- Auth utilities live in `server/auth.ts` (OTP generation, HMAC-signed session cookies). Requires `AUTH_SECRET` in environment (see `.env` sample). OTP codes are only returned in responses when `NODE_ENV !== 'production'`; production just logs server-side.
- Session cookie name: `waelio_session`, `sameSite:lax`, `httpOnly`, `secure` in production. `routes/auth/*` enforce origin allowlists and provide `request-otp`, `verify-otp`, `me`, and `logout` handlers with matching `.options.ts` for CORS preflight.

## Frontend & docs hooks
- Landing route (`routes/index.ts`) returns a simple HTML string; the user-facing landing page is `public/index.html`, which fetches `/api/health` and links docs/endpoints. If endpoints move, update both `public/index.html` and `frontend/src/App.vue` (iframe to `/openapi.html`).
- Theme toggle writes `data-theme` on `document.documentElement` in both `public/index.html` and `public/openapi.html`; reuse this convention for new pages.

## Dev, test, deploy flow
- Use `pnpm` only. Root scripts: `pnpm dev` (runs `dev:api` on 4000 and `dev:ui` on 3000), `pnpm build` (Nitro Netlify output), `pnpm start`/`pnpm preview` (serve `.output/server/index.mjs`). Frontend-only: run `pnpm dev|build|preview` inside `frontend/`.
- E2E via Playwright: `pnpm test:e2e` (or `test:e2e:ui`) autostarts `pnpm dev` and hits `http://localhost:3000` per `playwright.config.ts`. Contract expectations live in `tests/e2e/*.spec.ts` (health, holynames filter, quran query, OpenAPI).
- Netlify deploy uses `pnpm build`, publishes `public`, and functions from `.netlify/functions-internal`; environment sets `NITRO_PRESET=netlify`, `NODE_VERSION=20`.

## Conventions & gotchas
- ESM-only (`"type": "module"`, `moduleResolution: "bundler"`); avoid CommonJS helpers. Keep formatting consistent with existing files.
- When adding APIs: update `routes/api/_openapi.get.ts`, ensure CORS handling matches public vs auth patterns, and keep `routes/**` & `src/routes/**` aligned if touching both.
- Keep data edits in sync between `data/` and `shared/data/`; tests rely on the runtime `data/` copies.
