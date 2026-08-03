# convenientia-ops

Internal operations dashboard for Convenientia IT Consulting. Private — not for distribution.

Three pillars this tool serves:
1. **Market research** — scan verticals for companies with archaic workflows
2. **Business development** — pipeline of prospects, contacts, insight tracking
3. **Client delivery** — bespoke software projects for clients

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: set NEXTAUTH_SECRET (openssl rand -base64 32), ADMIN_USERNAME, ADMIN_PASSWORD
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000 and sign in with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Remote access via Cloudflare Tunnel

```powershell
# One-time setup (see plan doc for full instructions)
winget install --id Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create convenientia-ops

# Run
.\start.ps1
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 · SQLite · NextAuth.js v5 (Credentials) · Recharts · Cloudflare Tunnel
