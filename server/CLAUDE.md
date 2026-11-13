# server — Node + Express API (meda-hub)

Runs on our VPS in Docker behind Traefik. Receives webhooks, pulls data from sources, later writes to Supabase.

## Stack
- Node.js current LTS (check nodejs.org; pin it in `.nvmrc`, `engines` and the Dockerfile)
- Express 5, TypeScript (strict), native ESM (`"type": "module"`)
- `tsx` for dev (watch mode), `tsc` for build
- `zod` for env validation and payload validation
- `pino` (+ `pino-http`) for logging, `pino-pretty` in dev only
- `helmet`, `cors`
- Native `fetch` for HTTP (no axios)
- `libphonenumber-js` for phone normalization
- `vitest` for tests, ESLint (flat config) + Prettier
Ask before adding anything else.

## Imports
- ESM only. No `require`.
- Use Node subpath imports for internal paths instead of `../../..`:
  `"imports": { "#*": "./dist/*" }` in package.json (what Node uses at runtime on the built code),
  `"paths": { "#*": ["./src/*"] }` in tsconfig (what tsc/tsx use), and the same alias in `vitest.config.ts`.
  e.g. `import { env } from "#config/env.js"`.

## Folder structure (feature/module based, so new sources are just new folders)
```
server/
├── src/
│   ├── app.ts                # builds the express app (middleware, routes) — no listen()
│   ├── index.ts              # starts the server, graceful shutdown (SIGTERM/SIGINT)
│   ├── config/
│   │   ├── env.ts            # zod-validated env, app crashes on startup if invalid
│   │   └── sources.ts        # builds the list of Shopify stores etc. from env
│   ├── modules/
│   │   ├── health/           # GET /health
│   │   ├── shopify/
│   │   │   ├── shopify.client.ts     # GraphQL calls, auth, pagination, rate limits
│   │   │   ├── shopify.service.ts    # business logic (map Shopify data → our shape)
│   │   │   ├── shopify.routes.ts     # dev test routes + webhook routes
│   │   │   ├── shopify.webhooks.ts   # HMAC verification + handlers
│   │   │   └── shopify.schemas.ts    # zod schemas / types
│   │   └── tagmango/          # same pattern
│   ├── lib/
│   │   ├── logger.ts
│   │   ├── phone.ts          # normalizePhone(), isBlockedPhone(), maskPhone()
│   │   └── http.ts           # fetch wrapper: timeout, retry with backoff, error mapping
│   ├── middleware/
│   │   ├── error-handler.ts  # one place that turns errors into JSON responses
│   │   ├── not-found.ts
│   │   └── dev-only.ts       # blocks /dev routes unless NODE_ENV=development or ENABLE_DEV_ROUTES=true
│   └── routes.ts             # mounts all module routers
├── tests/
├── Dockerfile                # multi-stage, non-root user, HEALTHCHECK on /health
├── docker-compose.yml        # local run
├── docker-compose.prod.yml   # VPS run: env_file .env, Traefik labels, restart unless-stopped
├── .env.example
└── .dockerignore
```
Each module owns its routes, client, service and schemas. Modules never import each other's internals; shared code goes in `lib/`.

## Conventions
- Webhook routes need the RAW body for HMAC verification: use `express.raw()` on those routes only, `express.json()` elsewhere. Respond 200 fast, then process.
- Every external call goes through `lib/http.ts` (timeout + retry + logging).
- Async errors are thrown, not caught per route; `error-handler.ts` handles them (Express 5 forwards rejected promises).
- Responses: `{ data }` on success, `{ error: { code, message } }` on failure.
- Mask phone/email in logs with `maskPhone()` / `maskEmail()`.

## Env (multi-store, no code change to add a store)
```
NODE_ENV=development
PORT=4000
CORS_ORIGINS=http://localhost:3000            # comma-separated; add the Vercel domain in prod
ENABLE_DEV_ROUTES=true

SHOPIFY_API_VERSION=                           # set to the latest stable version from Shopify docs
SHOPIFY_STORES=wayveda,naturemania            # keys; each key needs the vars below
SHOPIFY_WAYVEDA_DOMAIN=xxxx.myshopify.com
SHOPIFY_WAYVEDA_ACCESS_TOKEN=
SHOPIFY_WAYVEDA_WEBHOOK_SECRET=
SHOPIFY_NATUREMANIA_DOMAIN=
SHOPIFY_NATUREMANIA_ACCESS_TOKEN=
SHOPIFY_NATUREMANIA_WEBHOOK_SECRET=

TAGMANGO_...=                                  # fill after checking what TagMango provides
```
Check Shopify's current docs for how custom/internal apps get an Admin API token (the way apps are created and authenticated has changed over time).

## Phase 1 scope (source testing, NO database)
- `GET /health`
- Dev-only routes to prove each source works, e.g.
  `GET /dev/shopify/:store/orders?limit=5`, `GET /dev/shopify/:store/customers?limit=5`,
  `GET /dev/shopify/:store/abandoned-checkouts?limit=5`, `GET /dev/tagmango/...`
  Return the raw response plus a small "mapped" preview (normalized phone, email, name, totals).
- Webhook receiver `POST /webhooks/shopify/:store/:topic`: verify HMAC, log a masked summary, save the raw payload to `.data/webhooks/<store>/<topic>/<timestamp>.json` (gitignored) so we can inspect real payloads. Test locally through a cloudflared/ngrok tunnel.
- No Supabase, no Prisma/Drizzle yet.
