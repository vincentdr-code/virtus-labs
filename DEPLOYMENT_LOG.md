# Deployment Log

## Aug 5, 2026 — EC2 deployment + rebrand to Virtus Labs

### Summary

Deployed the app (then named `convenientia-ops`) to the existing AWS t2.micro
EC2 instance that already runs the Cosmas project, on port 3100 behind nginx,
with a Let's Encrypt certificate. Later the same night, renamed the project
end to end — GitHub repo, on-disk directory, systemd service, nginx vhost,
and DuckDNS domain — from Convenientia Ops to **Virtus Labs**.

Live at: `https://virtus-labs.duckdns.org`

### EC2 setup — steps performed

1. Cloned the repo to `/home/ubuntu/convenientia-ops` (2 GB swap already
   configured on the box from prior work)
2. Configured `.env`: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`
3. `npm ci` → `npx prisma generate` → `npx prisma migrate deploy` → `npm run build`
4. Created a systemd unit (`convenientia.service`, later renamed) —
   `WorkingDirectory` at the repo, `PORT=3100`, `Restart=always`
5. Configured nginx as a reverse proxy to `localhost:3100`, with
   `X-Forwarded-Host` / `X-Forwarded-Proto` headers set for NextAuth
6. Registered a DuckDNS domain pointed at the EC2 public IP
7. Issued an HTTPS certificate with `certbot --nginx`

### Issues hit and fixed

- **Private repo, HTTPS clone hung on password prompt.** GitHub rejected
  password auth outright (`Password authentication is not supported for Git
  operations`), then a follow-up attempt just hung waiting for input with no
  way to paste into the SSH client. Resolved by generating a GitHub
  Personal Access Token and using it as the password; later moved to cloning
  over plain HTTPS once the repo was made public.

- **Repeated spelling mismatch: "conventientia" vs "convenientia".** Cost
  real time across the session — clone URLs, the systemd unit filename, and
  the working directory were created under the wrong spelling more than
  once, producing `Unit convenientia.service could not be found` and
  `No such file or directory` errors that looked like unrelated failures.
  Fixed each time by locating the actual on-disk name (`ls`) and correcting
  it to match, and by being deliberate about the spelling from then on.

- **`EADDRINUSE :::3100` on service start.** A previous failed start had
  left an orphaned `node` process holding the port, so every restart
  attempt failed at bind time. Fixed with `sudo fuser -k 3100/tcp` before
  restarting the service.

- **DuckDNS pointed at the wrong IP.** The domain's "current ip" field had
  auto-populated with the visitor's own detected IP rather than the EC2
  instance's IP, so certbot's HTTP-01 challenge timed out
  (`Timeout during connect (likely firewall problem)`). Fixed by manually
  setting the DuckDNS A record to the EC2 public IP before retrying certbot.

- **Login always returned "Invalid username or password" — root cause was
  a missing closing quote.** This was the single biggest time sink of the
  night. `lib/auth.ts` authenticates by comparing the submitted credentials
  directly against `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` — there
  is no `User` table and no database involved in login at all. Before
  finding that, a lot of time went into a dead end: assuming a Prisma
  `User` model existed, running `prisma db seed`, inspecting SQLite tables,
  and even hand-inserting a bcrypt-hashed row — none of which had any
  effect, because the schema truly has no `User` model and login never
  touches the database. The actual bug was in `.env`:
  ```
  ADMIN_USERNAME="convdanny97       <- no closing quote
  ADMIN_PASSWORD="bigdaddy69"       <- correct, for comparison
  ```
  With the closing `"` missing, the env parser had no defined end for the
  string and the loaded value carried a stray leading `"` character,
  so it never matched what was actually typed into the login form. Fixed
  by adding the missing closing quote; confirmed with
  `node -e "require('dotenv').config(); console.log(JSON.stringify(process.env.ADMIN_USERNAME))"`
  before and after, which is what exposed the stray quote in the first
  place — `cat` alone doesn't reveal invisible/malformed characters.

### Rebrand — Convenientia Ops → Virtus Labs

1. Renamed the GitHub repository via Settings → Repository name
2. Find/replaced all three casings across the tracked source
   (`CONVENIENTIA` → `VIRTUS LABS`, `Convenientia` → `Virtus Labs`,
   `convenientia` → `virtus-labs`), explicitly excluding this log file so
   the historical record stays accurate to what actually happened
3. `npm run build`, renamed the on-disk directory to `~/virtus-labs`, and
   updated the git remote to the renamed repo URL
4. Renamed the systemd unit to `virtus-labs.service` and updated its
   `Description` / `WorkingDirectory`
5. Registered a new DuckDNS domain, `virtus-labs.duckdns.org`, pointed at
   the same EC2 IP
6. Re-pointed the nginx vhost at the new domain and re-ran certbot

**Mistake during step 6, fixed in place:** the nginx vhost file being copied
already had certbot-managed `ssl_certificate` / `ssl_certificate_key`
directives pointing at the *old* domain's certificate files. A blanket
`sed 's/convenientia-ops.duckdns.org/virtus-labs.duckdns.org/'` rewrote
those paths too, pointing nginx at a certificate that didn't exist yet —
so `nginx -t` (and therefore certbot's own pre-flight check) failed with
`cannot load certificate ".../virtus-labs.duckdns.org/fullchain.pem": ...
no such file`. Fixed by replacing the vhost with a clean, plain HTTP-only
server block (no SSL directives at all) so certbot could complete the
ACME challenge and write correct SSL directives for the new certificate
itself, rather than trying to reuse a hand-edited copy of an already
certbot-managed file.

### Result

- systemd service `virtus-labs` — active, auto-restarts on crash/reboot
- nginx + certbot HTTPS on `virtus-labs.duckdns.org` — auto-renewing
- Login confirmed working
- Repo, directory, service, and domain names now consistent with the
  Virtus Labs name throughout
