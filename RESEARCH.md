# Research Library

The Research tab is a standing intelligence system for seven trades across
three markets, refreshed by a weekly scan that emails a digest.

**Trades:** Mechanical · Electrical · Plumbing · HVAC · Architecture ·
Environmental Engineering · Civil Engineering

**Markets:** Austin TX · Northern Virginia · Miami FL

## How it works

```
weekly schedule
      │
      ▼
POST /api/research/scan          (bearer token = CRON_SECRET)
      │
      ├─ fetch 26 sources in parallel, each failure isolated
      ├─ classify each item to a trade + metro by keyword
      ├─ dedupe on normalized URL (tracking params stripped)
      ├─ score importance 1-3 from source tier, signal phrases, locality, age
      ├─ Claude rewrites summaries + re-scores (optional, degrades gracefully)
      ├─ write NewsItems + a ScanRun record
      └─ email the digest, grouped by metro
```

## Sources

All free. No paid subscriptions, no API keys required.

| Tier | What | Why it ranks where it does |
|---|---|---|
| Regulatory | Federal Register API, EPA, OSHA | Primary record of an actual rule change, not commentary about one |
| Research journal | OpenAlex (7 queries), arXiv | OpenAlex indexes essentially all scholarly work and is free with no key — this is what makes journal coverage viable without subscriptions |
| Government data | City of Austin permit open data | Permits filed are a leading indicator of which trades are about to be busy |
| Trade press | ENR, Construction Dive, ACHR News, Plumbing & Mechanical, ArchDaily, Utility Dive, Smart Cities Dive | Fastest to surface a shift; covers the contractor-business angle |

Four entries (EC&M, BD+C, EPA Newsroom, FacilitiesNet) are present but
`enabled: false` — probing found no working feed path. They are kept in the
registry rather than deleted so the gap is visible and re-probing is cheap.

If a source starts failing, `npm run discover:feeds` probes common feed
conventions per publisher and prints the real URL.

Add or disable sources in `lib/research/sources.ts`.

**Verify sources are live** (run on the server, not in a sandbox — restricted
egress makes every host look dead):

```bash
npm run verify:sources          # probe all
npm run verify:sources openalex # probe matching ids
```

Set `enabled: false` on anything that stays dead.

## Importance scoring

`1` background · `2` worth reading · `3` worth flagging (bolded in the email)

Score starts from source-tier weight, then:

- **+2** high-signal phrase — "final rule", "effective date", "deadline", "phase-out", "recertification", "acquisition"
- **+1** medium signal — "proposed rule", "study finds", "forecast"
- **−2** low signal — "sponsored", "webinar", "top 10", "award"
- **+1** the item names one of the three target metros
- **−1 / −2** older than 30 / 120 days

## Setup

Add to `.env` on the server:

```bash
DIGEST_TO_EMAIL="daniel.vincent572@gmail.com"
CRON_SECRET="$(openssl rand -base64 32)"

# Gmail: use an App Password (myaccount.google.com → Security →
# 2-Step Verification → App passwords), NOT your account password.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="daniel.vincent572@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="Virtus Labs Research <daniel.vincent572@gmail.com>"
```

Then:

```bash
npx prisma migrate deploy
npm run seed:research     # 7 trades with per-metro breakdowns
npm run build
sudo systemctl restart virtus-labs
```

## Running a scan

```bash
npm run research:scan            # scan + email
npm run research:scan -- --dry   # scan only, no email
npm run research:scan -- --email-only   # resend last 7 days
```

Or over HTTP:

```bash
curl -X POST https://virtus-labs.duckdns.org/api/research/scan \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Weekly schedule

Monday 7am ET via cron on the EC2 box:

```bash
crontab -e
```

```cron
0 11 * * 1 curl -fsS -X POST https://virtus-labs.duckdns.org/api/research/scan -H "Authorization: Bearer YOUR_CRON_SECRET" >> /home/ubuntu/research-scan.log 2>&1
```

Cron runs in UTC; `11:00 UTC` is 7am EDT / 6am EST.

## Testing

```bash
npm run test        # 53 unit tests
npm run test:e2e    # 31 e2e (needs the app running)
npm run test:all    # lint + unit + e2e
```

## Notes

- Login uses `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env` directly — there
  is no user table. A malformed value there (a missing closing quote) breaks
  login without any DB involvement.
- The scan endpoint requires auth: a session cookie, or the `CRON_SECRET`
  bearer token. It spends API budget and sends mail, so it is never open.
- Seeded content is a starting position dated in the file. The weekly scan is
  what keeps the library current — treat baseline figures as stale until the
  feed confirms them.
