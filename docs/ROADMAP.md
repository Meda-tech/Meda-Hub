# meda-hub roadmap

Work top to bottom. Stop for review after every numbered step. Tick boxes as they are done.

## Phase 0 — Project setup
- [x] 0.1 Repo: root `.gitignore` (node_modules, .env*, !.env.example, .next, dist, .data), root README with how to run both apps
- [x] 0.2 server: init Node + TypeScript + ESM + Express 5 per server/CLAUDE.md; `/health` working; ESLint/Prettier/vitest; scripts `dev`, `build`, `start`, `test`, `lint`
- [ ] 0.3 server: Dockerfile (multi-stage, non-root, healthcheck), `.dockerignore`, `docker-compose.yml`; confirm `docker compose up` serves `/health`
- [ ] 0.4 client: `npx create-next-app@latest client` (TypeScript, Tailwind, App Router, src dir, ESLint); add DESIGN.md (`npx getdesign@latest add vercel`); simple status page calling server `/health`
- [ ] 0.5 GitHub Actions `.github/workflows/server-deploy.yml`: on push to main touching `server/**` → build image → push to ghcr.io/<org>/meda-hub-server → SSH to VPS → `docker compose -f docker-compose.prod.yml pull && up -d`. Secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY. Also a CI workflow (lint + test + build) on PRs for both apps.
- [ ] 0.6 server: `docker-compose.prod.yml` with `env_file: .env` and Traefik labels (host api.<domain>, TLS cert resolver, port 4000, external traefik network — names to be confirmed with existing VPS setup)

## Phase 1 — Test the sources (no database)
- [ ] 1.1 Shopify client: auth, GraphQL, cursor pagination, rate-limit handling; multi-store config from env
- [ ] 1.2 Dev routes: orders, customers, abandoned checkouts for one store; mapped preview with normalized phone
- [ ] 1.3 Same routes working for all configured stores
- [ ] 1.4 Shopify webhook receiver with HMAC check; save raw payloads to .data/; test via tunnel (orders/create, orders/updated, checkouts/create, checkouts/update)
- [ ] 1.5 TagMango: document what access exists, then a dev route that fetches learners/purchases
- [ ] 1.6 Write docs/SOURCES.md: for each source, what fields we actually get (phone present? verified? email? payment method?) — this decides the DB design

## Phase 2 — Deploy server to VPS
- [ ] 2.1 First deploy through GitHub Actions; `/health` live on https://api.<domain>
- [ ] 2.2 Point real Shopify webhooks at the VPS; confirm payloads arrive
- [ ] 2.3 Client on Vercel (root directory `client`, region bom1) showing server status

## Phase 3 — Save data (Supabase)
- [ ] 3.1 Tables from docs/DATA-MODEL.md (Stage 1 only) + migrations
- [ ] 3.2 Phone normalization + profile matching (phone only)
- [ ] 3.3 Webhooks upsert profiles, venture customers, orders, checkouts (idempotent)
- [ ] 3.4 Backfill script for historical orders per store
- [ ] 3.5 Nightly reconciliation pull (last 48h) as a safety net

## Phase 4 — Admin + automations
- [ ] 4.1 Auth for the client (decide: Supabase Auth or other)
- [ ] 4.2 Customers list + customer page (profile, ventures, orders, checkouts)
- [ ] 4.3 n8n reads abandoned checkouts → WhatsApp → writes message_log
- [ ] 4.4 WhatsApp incoming webhook → whatsapp_messages; STOP → opt-out

## Later (only when needed)
Courier/RTO/returns, GoKwik/Fastrr, consents per venture, customer segments, CEO dashboard metrics, shared-phone handling, merge/split tools.
