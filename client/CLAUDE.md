# client — Next.js frontend (meda-hub)

Admin UI for the team. Deployed on Vercel (Functions region: Mumbai, bom1) for now; will move to the VPS in Docker later, so keep it portable.

## Stack
- Next.js latest (created with `npx create-next-app@latest`): App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory, import alias `@/*`
- Design system: follow `DESIGN.md` (added with `npx getdesign@latest add vercel`) for colors, type, spacing and components
- Use the `frontend-design` skill for any UI work
Ask before adding other libraries (UI kits, state managers, data fetching libs).

## Rules
- The client only talks to our server (`NEXT_PUBLIC_API_URL`), never to Shopify/TagMango/Supabase-with-secrets directly.
- No Vercel-only features (KV, Blob, Postgres, Edge Config, Cron, `@vercel/*` for core logic). Keep `output: 'standalone'`-compatible so it can run in Docker later.
- `NEXT_PUBLIC_*` vars are baked in at build time; anything secret must never start with `NEXT_PUBLIC_`.
- No customer data (phones, emails, orders) is shown anywhere until authentication exists (Roadmap Phase 4). Until then the client only shows system/source status.
- Server components by default; `"use client"` only where interactivity needs it.

## Structure
```
client/src/
├── app/                # routes (App Router)
│   ├── layout.tsx
│   ├── page.tsx        # Phase 1: system status page
│   └── (dashboard)/    # later: customers, orders, inbox (behind auth)
├── components/
│   ├── ui/             # small reusable pieces built from DESIGN.md
│   └── features/       # feature-specific components
├── lib/
│   └── api.ts          # one typed fetch wrapper for calling the server
└── types/
```

## Env
```
NEXT_PUBLIC_API_URL=http://localhost:4000      # prod: https://api.<domain>
```
