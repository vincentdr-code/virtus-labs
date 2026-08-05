#!/usr/bin/env node
/**
 * End-to-end smoke suite. Requires the app running on BASE_URL
 * (default http://localhost:3000) with ADMIN_USERNAME / ADMIN_PASSWORD
 * from the environment or .env.
 *
 * Covers:
 *  - login flow
 *  - every nav route renders (no error page, expected heading present)
 *  - unauthenticated requests redirect to /login
 *  - PWA manifest + icons are publicly fetchable
 *  - no horizontal page scroll at mobile width (375px)
 *  - sidebar collapse/expand works
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

// Pull admin creds from .env if not in the environment
if (!process.env.ADMIN_USERNAME && existsSync(new URL("../.env", import.meta.url))) {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^(ADMIN_USERNAME|ADMIN_PASSWORD)="?([^"]*)"?$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const USER = process.env.ADMIN_USERNAME;
const PASS = process.env.ADMIN_PASSWORD;
if (!USER || !PASS) {
  console.error("ADMIN_USERNAME / ADMIN_PASSWORD not set");
  process.exit(1);
}

const ROUTES = [
  { path: "/", heading: "Dashboard" },
  { path: "/cosmas", heading: "COSMAS Pipeline" },
  { path: "/pipeline", heading: "Pipeline" },
  { path: "/companies", heading: "Companies" },
  { path: "/deals", heading: "Deals" },
  { path: "/projects", heading: "Client Projects" },
  { path: "/consultation", heading: "Consultation Sessions" },
  { path: "/outreach", heading: "Outreach" },
  { path: "/contacts", heading: "Contacts" },
  { path: "/meeting-prep", heading: "Meeting Prep" },
  { path: "/research", heading: "Vertical Research" },
  { path: "/financials", heading: "Financials" },
  { path: "/settings", heading: "Settings" },
];

let passed = 0;
let failed = 0;
function ok(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}
function fail(name, detail) {
  failed++;
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

const executablePath =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";
const browser = await chromium.launch({ executablePath });

try {
  // --- unauthenticated redirect ---
  {
    const page = await browser.newPage();
    const resp = await page.goto(`${BASE}/deals`, { waitUntil: "domcontentloaded" });
    if (page.url().includes("/login")) {
      ok("unauthenticated /deals redirects to /login");
    } else {
      fail("unauthenticated /deals redirects to /login", `landed on ${page.url()} (${resp?.status()})`);
    }
    await page.close();
  }

  // --- manifest + icons public ---
  for (const asset of ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"]) {
    const page = await browser.newPage();
    const resp = await page.goto(`${BASE}${asset}`);
    if (resp && resp.status() === 200 && !page.url().includes("/login")) {
      ok(`${asset} is publicly fetchable`);
    } else {
      fail(`${asset} is publicly fetchable`, `status ${resp?.status()}, url ${page.url()}`);
    }
    await page.close();
  }

  // --- login ---
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(`${BASE}/`, { timeout: 15000 });
    ok("login with admin credentials");
  } catch {
    fail("login with admin credentials", `stuck at ${page.url()}`);
    throw new Error("cannot continue without login");
  }

  // --- every route renders ---
  for (const { path, heading } of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const h1 = await page.locator("header h1").first().textContent().catch(() => null);
    if (h1 && h1.includes(heading)) {
      ok(`${path} renders "${heading}"`);
    } else {
      fail(`${path} renders "${heading}"`, `got "${h1}"`);
    }
  }

  // --- sidebar collapse/expand ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.click('button[title="Collapse sidebar"]');
  await page.waitForTimeout(350);
  const collapsedWidth = await page.locator("aside").evaluate((el) => el.offsetWidth);
  if (collapsedWidth < 100) {
    ok(`sidebar collapses to icon rail (${collapsedWidth}px)`);
  } else {
    fail("sidebar collapses to icon rail", `width ${collapsedWidth}px`);
  }
  await page.click('button[title="Expand sidebar"]');
  await page.waitForTimeout(350);
  const expandedWidth = await page.locator("aside").evaluate((el) => el.offsetWidth);
  if (expandedWidth > 200) {
    ok(`sidebar expands back (${expandedWidth}px)`);
  } else {
    fail("sidebar expands back", `width ${expandedWidth}px`);
  }

  // --- no horizontal scroll at 375px on key pages ---
  await page.setViewportSize({ width: 375, height: 800 });
  for (const path of ["/", "/contacts", "/deals", "/cosmas"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow <= 1) {
      ok(`${path} has no horizontal page scroll at 375px`);
    } else {
      fail(`${path} has no horizontal page scroll at 375px`, `${overflow}px overflow`);
    }
  }

  await page.close();
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
