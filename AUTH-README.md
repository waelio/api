# Shared auth guide for waelio/peace2074 sites

Use this API as the central auth service for your sites (OTP today; social login optional next). This doc keeps all sites on the same page.

## Current endpoints (OTP)

- `POST /auth/request-otp` — body `{ email }`; returns `devCode` only in non-production.
- `POST /auth/verify-otp` — body `{ email, code }`; sets `waelio_session` cookie.
- `GET /auth/me` — returns current user or 401.
- `POST /auth/logout` — clears session cookie.

## Allowed origins (CORS)

Add the site origins you need in `routes/auth/*.ts` (+ matching `.options.ts`). Current set to consider:

- `https://waelio.com`
- `https://www.waelio.com`
- `https://waelio.netlify.app`
- `https://peace2074.com`
- `https://www.peace2074.com`
- `https://peace2074.netlify.app`

## Cookie vs. token strategy

- **Same eTLD+1 (subdomains)**: you can share the session cookie by setting `domain: '.peace2074.com'` (keep `sameSite: 'lax'`, `secure: true`, `httpOnly: true`).
- **Cross-domain (e.g., waelio.com, netlify.app)**: browsers won’t share cookies. Use a token handoff (JWT or short-lived code) from this auth server; each site sets its own cookie locally after receiving the token.

## Social login (planned pattern)

- Add `/auth/login/:provider` (redirect) and `/auth/callback/:provider` (code exchange → user → session/JWT).
- Register the canonical callback at the provider, e.g., `https://api.waelio.com/auth/callback/google`.
- For cross-domain callers, return a JWT or short-lived code via `postMessage` to the opener; the caller sets its own cookie.

## Onboarding a new site

1. Add its origin to the auth CORS allowlist (and preflight handlers).
2. Decide cookie scope:
   - Subdomain of peace2074 → set cookie domain `.peace2074.com` if you want it shared.
   - Different domain → use token handoff; do **not** rely on shared cookie.
3. Frontend flow options:
   - **OTP**: call request-otp → verify-otp → me with `Origin` header and credentials; reuse the same cookie jar.
   - **Social (when enabled)**: open popup to `/auth/login/google?returnUrl=<caller>`; receive token via `postMessage`; store it via your backend as HttpOnly cookie.
4. Keep `Origin` exact (`https://…`) on requests; preflight must pass.

## Environment

- Required: `AUTH_SECRET` (signs `waelio_session`).
- Suggested for tokens: `AUTH_JWT_SECRET` (separate from `AUTH_SECRET`).
- Optional for subdomain sharing: `AUTH_COOKIE_DOMAIN` (e.g., `.peace2074.com`).
- Public base: `AUTH_PUBLIC_URL` (e.g., `https://api.waelio.com`).
- For Google (when enabled): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- For DeepSeek AI: `DEEPSEEK_API_KEY` (required for `/api/deepseek` endpoint).
- For user profiles: `MONGODB_URI` (MongoDB connection string for user data).


## Quick curl (OTP)

```sh
# 1) Request OTP
curl -i -X POST https://api.waelio.com/auth/request-otp \
  -H "Origin: https://peace2074.com" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  -d '{"email":"you@example.com"}'

# 2) Verify OTP (with Remember Me)
curl -i -X POST https://api.waelio.com/auth/verify-otp \
  -H "Origin: https://peace2074.com" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt --cookie cookies.txt \
  -d '{"email":"you@example.com","code":"123456","rememberMe":true}'

# Without Remember Me (24-hour session):
# -d '{"email":"you@example.com","code":"123456","rememberMe":false}'

# 3) Check session
curl -i -X GET https://api.waelio.com/auth/me \
  -H "Origin: https://peace2074.com" \
  --cookie-jar cookies.txt --cookie cookies.txt
```

## Session Duration (Remember Me)

**Industry-standard behavior:**
- **rememberMe: false** (default) → Session lasts **24 hours**
- **rememberMe: true** → Session lasts **30 days**

Both use secure HttpOnly cookies with the same security features.

## Gotchas

- OTP window: 10 minutes. Code returned only in non-prod; prod must deliver out-of-band.
- CORS must match exactly; otherwise preflight/Origin will fail.
- Netlify/app domains cannot share cookies with peace2074/waelio roots; use token handoff there.
- Keep `secure: true`, `httpOnly: true`, `sameSite: 'lax'`; only add `domain` when you truly want subdomain sharing.
