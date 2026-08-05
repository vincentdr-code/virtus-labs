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
| `/research` | Vertical research library — pain points, buyer profiles, market shifts |
| `/meeting-prep` | Auto-assembled prep sheet: archaic signals, research, last interaction, open deal |
| `/deals` | Deal tracking with pipeline-by-stage chart |
| `/projects` | Active client project tracker |
| `/consultation` | **Consultation Prototype Builder** (see below) |

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

## Setup

```bash
npm install
cp .env.example .env
# Edit .env:
#   NEXTAUTH_SECRET  — node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   ADMIN_USERNAME / ADMIN_PASSWORD — your login credentials
#   ANTHROPIC_API_KEY — for the Consultation Prototype Builder
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000 and sign in with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Deployment

Two deployments exist for this app:

### AWS EC2 (t2.micro) — live at virtus-labs.duckdns.org

Runs alongside the Cosmas project on the same existing t2.micro, behind nginx
with a Let's Encrypt certificate, as a systemd service.

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

### Oracle Cloud Always Free ($0)

The app also runs 24/7 on Oracle's Always Free tier (VM.Standard.E2.1.Micro —
1 OCPU, 1 GB RAM, never expires) with a Cloudflare Tunnel providing the public
HTTPS URL.

```bash
# On the Oracle VM (Ubuntu 22.04, user: ubuntu)
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

git clone git@github.com:vincentdr-code/virtus-labs.git ~/virtus-labs
cd ~/virtus-labs
nano .env          # production values; NEXTAUTH_URL = public tunnel hostname
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 start npm --name "virtus-labs" -- start
pm2 save && pm2 startup

# Cloudflare Tunnel as a system service
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o ~/cloudflared
chmod +x ~/cloudflared && sudo mv ~/cloudflared /usr/local/bin/cloudflared
cloudflared tunnel login
cloudflared tunnel create virtus-labs
# write ~/.cloudflared/config.yml (tunnel id + ingress -> http://localhost:3000)
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Future deploys: SSH in and run `~/deploy.sh` (git pull, install, migrate, build, pm2 restart).

#### Alternative: run from this machine

```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create virtus-labs
.\start.ps1
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 · SQLite · NextAuth.js v5 (Credentials) · Recharts · Anthropic Claude API · Web Speech API · nginx · Let's Encrypt · Cloudflare Tunnel · AWS EC2 · Oracle Cloud Always Free
