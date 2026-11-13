# meda-hub

Central customer data + automation hub for the MeDa Partners ventures (WayVeda, NatureMania and other brands).
It pulls customer, order and checkout data from every venture's sources into one place, so we can:
- run WhatsApp / email automations (abandoned carts, order updates) from one system
- see one customer across all ventures (one "super profile" per person)
- later: power the CEO dashboard and customer quality analysis (delivered, RTO, returns)

## Golden rule: start simple, upgrade when needed
Build the smallest working version of each step, get it reviewed, then move on.
Do NOT build future phases early. Do NOT add tables, services or libraries "for later".
Follow docs/ROADMAP.md phase by phase and STOP for review at the end of every step.

## Repo layout (monorepo, two independent apps)
```
meda-hub/
├── client/   Next.js (App Router, TypeScript, Tailwind) → deployed on Vercel (Mumbai, bom1)
├── server/   Node + Express (TypeScript, ESM)            → Docker on our VPS behind Traefik
├── docs/     ROADMAP.md (phases), DATA-MODEL.md (future DB design)
└── .github/workflows/  server deploy via GitHub Actions
```
- client and server have their own package.json, lockfile, .env and CLAUDE.md. Read the CLAUDE.md of the folder you work in.
- client never talks to data sources directly. Everything goes through server.
- Repo is owned by the company GitHub organization; commits/PRs are made from the developer's own account.

## Data sources (test first, save later)
| Source | How we get data | Phase |
|---|---|---|
| Shopify stores (several, one per venture/brand) | Admin GraphQL API (pull) + webhooks (push) | 1 |
| TagMango (courses / learners) | Verify what TagMango offers (API, webhooks, exports) before coding | 1 |
| GoKwik / Fastrr checkouts | Webhooks / API, verify docs | later |
| Courier / shipping (delivered, RTO, returns) | Aggregator API, decide which one | later |
| WhatsApp Cloud API (incoming replies) | Meta webhook | later |

Every source is configured by environment variables, never hardcoded. Adding a new Shopify store = adding env vars, no code change.

## Key decisions (do not change without asking)
- Identity = phone number only. Normalize to E.164 (+91XXXXXXXXXX) with libphonenumber-js. Email is stored for reference and email automations, never used for matching.
- Profile ID is separate from the phone (phone is a unique column, not the primary key).
- Keep a blocklist of junk phones (9999999999, 1234567890, ...).
- Use the buyer/contact phone for identity, never the shipping phone.
- Database (from Phase 3): Supabase Postgres. Money stored as integer paise.
- Automations (WhatsApp/email sending) run in n8n on the VPS, reading from the database. meda-hub fills the database; n8n acts on it.
- No Vercel-only features in client (no Vercel KV/Blob/Postgres/Edge Config/Cron). The client must be movable to the VPS later with only a Dockerfile.

## Rules for working in this repo
- Small steps. After each step: summarize what changed, how to test it, and wait for approval.
- Ask before adding any dependency that isn't listed in the folder's CLAUDE.md.
- Never commit secrets. Every new env var goes into `.env.example` with a placeholder and a comment.
- Never log full customer phone numbers/emails in production logs (mask them: +91******5678).
- Before using any third-party API (Shopify, TagMango, Meta, couriers), check its CURRENT official docs for version and auth. Do not rely on memory.
- Conventional commits (feat:, fix:, chore:, docs:). One logical change per commit.
- Keep docs/ROADMAP.md checkboxes updated as steps complete.
