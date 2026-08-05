# Deploying Convenientia Ops

Right now the app runs on `localhost:3000` on one machine. This guide takes it
to the existing EC2 box so it is reachable from any device, then installable
as a taskbar app everywhere.

## Answers to the three common questions

**Is this working on an EC2 deployment?**
Not yet — nothing in the code prevents it, but it has only ever run locally.
Follow the steps below to put it on the same t2.micro that already serves
COSMAS (nginx is already there; this app rides alongside on port 3100).

**How do I put it in my Windows taskbar?**
The app is a PWA. Open it in Chrome or Edge → menu (⋮) → *Cast, save and
share* → *Install page as app* (Edge: *Apps → Install this site as an app*).
It gets its own window, its own gold "C" icon, and can be pinned to the
taskbar / Start menu like any native app. This works today against
`http://localhost:3000` and will work against the deployed URL on every device.

**How do I use it from other computers/devices?**
`localhost` never leaves the machine. Once deployed behind HTTPS (below),
every device opens the same URL, logs in with the admin credentials, and can
install the same PWA. The SQLite database lives on the server, so all devices
see the same data.

## One-time EC2 setup

Prereqs on the box: Node.js 20+ (`node -v`), nginx (already present).
The t2.micro has 1 GB RAM — add swap once or `next build` may be OOM-killed:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

```bash
# 1. Get the code
cd /home/ubuntu
git clone https://github.com/vincentdr-code/convenientia-ops.git
cd convenientia-ops

# 2. Environment — real values, never committed
cp .env.example .env
nano .env   # set DATABASE_URL=file:./prod.db, a real NEXTAUTH_SECRET
            # (openssl rand -base64 32), NEXTAUTH_URL=https://YOUR_DOMAIN,
            # a strong ADMIN_PASSWORD, and the ANTHROPIC_API_KEY

# 3. Install, migrate, build
npm ci
npx prisma migrate deploy
npm run build

# 4. Service (runs on port 3100 so it never collides with COSMAS services)
sudo cp deploy/convenientia.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now convenientia
sudo systemctl status convenientia   # expect: active (running)

# 5. Domain + HTTPS
#    Create a DuckDNS subdomain (e.g. convenientia-ops.duckdns.org) pointing
#    at the EC2 IP, then:
sudo cp deploy/nginx-convenientia.conf /etc/nginx/sites-available/convenientia
sudo sed -i 's/YOUR_DOMAIN/convenientia-ops.duckdns.org/' \
    /etc/nginx/sites-available/convenientia
sudo ln -s /etc/nginx/sites-available/convenientia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d convenientia-ops.duckdns.org
```

HTTPS is not optional: PWA installation and secure auth cookies both
require it on any non-localhost origin.

## Updating a running deployment

```bash
cd /home/ubuntu/convenientia-ops
git pull origin master
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart convenientia
```

## Testing

```bash
npm run test:all     # lint + color-token check + unit tests + e2e
```

`test:e2e` needs the app running (`npm start`) and reads
ADMIN_USERNAME/ADMIN_PASSWORD from `.env`. Override the target with
`BASE_URL=https://your-domain npm run test:e2e`, and the browser binary with
`CHROMIUM_PATH` when not on the default Playwright layout.

## Gotchas

- **Port already in use after a restart**: `npm` being killed does not kill
  the `next-server` child. `sudo fuser -k 3100/tcp` then restart the service.
- **SQLite backups**: the entire database is one file (`prod.db` next to the
  app). `cp` it somewhere safe on a cron; that is a complete backup.
- **Redirects landing on localhost**: the auth middleware honors
  `X-Forwarded-Host` / `X-Forwarded-Proto`, which the provided nginx config
  sets — keep those lines if you edit it.
