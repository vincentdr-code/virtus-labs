# virtus-labs

Internal operations dashboard for Virtus Labs. Private — not for distribution.

Three pillars this tool serves:
1. **Market research** — scan verticals for companies with archaic workflows
2. **Business development** — pipeline of prospects, contacts, insight tracking
3. **Client delivery** — bespoke software projects for clients

## Features

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — pipeline value, active prospects, insights delivered, activity feed |
| `/pipeline` | Prospect table with status badges and deal value rollup |
| `/companies` | Company list, add form, detail pages with interaction timeline |
| `/contacts` | Cross-company contact directory with decision-maker flags |
| `/research` | **Research library** — 7 trades x 3 metros, weekly news feed, email digest (see [RESEARCH.md](RESEARCH.md)) |
| `/meeting-prep` | Auto-assembled prep sheet: archaic signals, research, last interaction, open deal |
| `/deals` | Deal tracking with pipeline-by-stage chart |
| `/projects` | Active client project tracker |
| `/consultation` | **Consultation Prototype Builder** (see below) |

## Research Library

Seven trades (mechanical, electrical, plumbing, HVAC, architecture,
environmental, civil) across Austin, Northern Virginia, and Miami. A weekly
scan pulls from 26 free sources — Federal Register rulemaking, OpenAlex and
arXiv research, municipal permit data, and trade press — classifies each item
to a trade and market, scores it, and emails a digest of what changed.

Full documentation: **[RESEARCH.md](RESEARCH.md)**

## Consultation Prototype Builder

An AI notetaker that sits in a discovery call and builds a working software
prototype in real time from the client's own words.

How it works:
1. Start a session before the call, activate the mic (Chrome/Edge — uses Web Speech API)
2. As the client speaks, the transcript accumulates on the left panel
3. Every 20 seconds of new speech, Claude analyzes the transcript:
   - **Filters out small talk** — only business content (workflows, problems, tools, volumes) is extracted
   - Captures pain points as direct quotes in the client's words
   - Generates a **live HTML prototype** — a real rendered interface using the client's exact terminology as field labels, buttons, and headers
4. The prototype renders in an iframe on the right panel and refines as the client reveals more
5. Click "End Meeting + Show Prototype" — a final analysis pass runs, then the brief page opens with the prototype full-width, pain points, feature blueprint, and scope estimate
6. Print / Save PDF to hand to the client

Requires `ANTHROPIC_API_KEY` in `.env` (get one at https://console.anthropic.com).

## Setup (local development)

This runs the app on your own machine against a local SQLite file — it is
not how production is served. For that, see **Deployment** below.

```bash
npm install
cp .env.example .env
# Edit .env:
#   NEXTAUTH_SECRET  — node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   ADMIN_USERNAME / ADMIN_PASSWORD — your login credentials
#   ANTHROPIC_API_KEY — for the Consultation Prototype Builder
npx prisma migrate dev
npx prisma db seed
npm run seed:research
npm run dev
```

Open http://localhost:3000 and sign in with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Deployment

Live at `https://virtus-labs.duckdns.org`, running on the existing AWS t2.micro
EC2 instance that also runs the Cosmas project, behind nginx with a Let's
Encrypt certificate, as a systemd service.

```bash
# On the EC2 box (Ubuntu, user: ubuntu)
git clone https://github.com/vincentdr-code/virtus-labs.git ~/virtus-labs
cd ~/virtus-labs
cp .env.example .env
nano .env           # DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
                     # ADMIN_USERNAME, ADMIN_PASSWORD, ANTHROPIC_API_KEY
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run seed:research
npm run build

# systemd service (PORT=3100, runs alongside other services on the box)
sudo nano /etc/systemd/system/virtus-labs.service
sudo systemctl daemon-reload
sudo systemctl enable --now virtus-labs

# nginx reverse proxy + HTTPS
sudo nano /etc/nginx/sites-available/virtus-labs   # proxy_pass http://localhost:3100
sudo ln -s /etc/nginx/sites-available/virtus-labs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d virtus-labs.duckdns.org
```

Update a running deployment:

```bash
cd ~/virtus-labs
git pull origin master
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart virtus-labs
```

See `DEPLOYMENT_LOG.md` for the full walkthrough of this deployment, including
issues hit and how they were fixed.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 · SQLite · NextAuth.js v5 (Credentials) · Recharts · Anthropic Claude API · Web Speech API · nginx · Let's Encrypt · AWS EC2
