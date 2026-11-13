# meda-hub

Central customer data + automation hub for the MeDa Partners ventures (WayVeda, NatureMania and other brands).

- Project rules and key decisions: [CLAUDE.md](CLAUDE.md)
- Phases and progress: [docs/ROADMAP.md](docs/ROADMAP.md)
- Future database design: [docs/DATA-MODEL.md](docs/DATA-MODEL.md)

## Repo layout

```
meda-hub/
├── client/   Next.js admin UI      → Vercel (Mumbai, bom1)
├── server/   Node + Express API    → Docker on the VPS behind Traefik
├── docs/     roadmap, data model
└── .github/workflows/  CI + server deploy
```

`client` and `server` are independent apps, each with its own `package.json`, lockfile, `.env` and `CLAUDE.md`.

## Prerequisites

- Node.js LTS — exact version pinned in `server/.nvmrc` (use `nvm use` inside `server/`)
- npm

## Run locally

> The apps are created in roadmap steps 0.2 (server) and 0.4 (client). Until then these commands won't work.

**Server** (http://localhost:4000, health check at `/health`):

```bash
cd server
cp .env.example .env    # then fill in values
npm install
npm run dev
```

**Client** (http://localhost:3000):

```bash
cd client
cp .env.example .env    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

Run the server first; the client's status page calls the server's `/health`.

## Secrets

Never commit `.env` files. Every env var is documented with a placeholder in the app's `.env.example`.
