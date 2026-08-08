#!/usr/bin/env node
/**
 * End-to-end checks for the research library. Requires the app running on
 * BASE_URL (default http://localhost:3000) with credentials in .env.
 *
 *   npm run build && npm start &
 *   npm run test:e2e
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const envPath = new URL("../.env", import.meta.url);
if (!process.env.ADMIN_USERNAME && existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^(ADMIN_USERNAME|ADMIN_PASSWORD)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const USER = process.env.ADMIN_USERNAME;
const PASS = process.env.ADMIN_PASSWORD;
if (!USER || !PASS) {
  console.error("ADMIN_USERNAME / ADMIN_PASSWORD not set");
  process.exit(1);
}

const TRADES = [
  "mechanical",
  "electrical",
  "plumbing",
  "hvac",
  "architecture",
  "environmental",
  "civil",
];
const METROS = ["austin", "nova", "miami"];

let passed = 0;
let failed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const fail = (n, d) => { failed++; console.error(`  ✗ ${n}${d ? ` — ${d}` : ""}`); };

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
});

try {
  // --- auth gate -----------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/research`, { waitUntil: "domcontentloaded" });
    if (page.url().includes("/login")) ok("unauthenticated /research redirects to /login");
    else fail("unauthenticated /research redirects to /login", `landed ${page.url()}`);
    await page.close();
  }

  // The scan endpoint spends API budget and sends mail — it must not be open,
  // and it must answer with a status rather than redirecting, so the weekly
  // scheduled caller can tell success from a login bounce.
  {
    const page = await browser.newPage();

    const bare = await page.request.post(`${BASE}/api/research/scan`, {
      maxRedirects: 0,
    });
    if (bare.status() === 401) ok("unauthenticated scan endpoint returns 401");
    else fail("unauthenticated scan endpoint returns 401", `got ${bare.status()}`);

    // A wrong bearer token must be rejected by the route handler itself.
    const badToken = await page.request.post(`${BASE}/api/research/scan`, {
      headers: { authorization: "Bearer definitely-not-the-secret" },
      maxRedirects: 0,
    });
    if (badToken.status() === 401) ok("scan endpoint rejects a wrong bearer token");
    else fail("scan endpoint rejects a wrong bearer token", `got ${badToken.status()}`);

    await page.close();
  }

  // --- login ---------------------------------------------------------------
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(`${BASE}/`, { timeout: 20000 });
    ok("login with admin credentials");
  } catch {
    fail("login", `stuck at ${page.url()}`);
    throw new Error("cannot continue without login");
  }

  // --- research index ------------------------------------------------------
  await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
  const h1 = await page.locator("header h1").first().textContent();
  if (h1?.includes("Vertical Research")) ok("/research renders");
  else fail("/research renders", `got "${h1}"`);

  const feedCount = await page.locator("article").count();
  if (feedCount > 0) ok(`feed renders items (${feedCount})`);
  else fail("feed renders items", "no article elements found");

  // Category chips must show the taxonomy label, never the raw storage slug.
  {
    const chips = await page.locator("article").allInnerTexts();
    const joined = chips.join(" ");
    if (joined.includes("M&A") && !/\bMA\b/.test(joined)) {
      ok("category chips render labels, not raw slugs");
    } else {
      fail("category chips render labels", "found a raw slug like 'MA'");
    }
    // A national item still needs a market label, not a blank slot.
    if (joined.includes("NATIONAL")) ok("national items show a market label");
    else fail("national items show a market label");
  }

  // --- every trade deep-dive page ------------------------------------------
  for (const trade of TRADES) {
    await page.goto(`${BASE}/research/${trade}`, { waitUntil: "networkidle" });
    const heading = await page.locator("header h1").first().textContent();
    const hasPainPoints = await page.getByText("Key Pain Points").count();
    const hasMarkets = await page.getByText("By Market").count();
    if (heading && heading.trim().length > 0 && hasPainPoints > 0 && hasMarkets > 0) {
      ok(`/research/${trade} has content, pain points, and metro breakdown`);
    } else {
      fail(
        `/research/${trade} content`,
        `heading="${heading}" painPoints=${hasPainPoints} markets=${hasMarkets}`,
      );
    }
  }

  // Each deep-dive must show all three metro sections — that is the 21 cells.
  {
    await page.goto(`${BASE}/research/hvac`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    const allThree =
      body.includes("AUSTIN") && body.includes("NORTHERN VIRGINIA") && body.includes("MIAMI");
    if (allThree) ok("deep-dive shows all three metro breakdowns");
    else fail("deep-dive shows all three metro breakdowns");
  }

  // --- filters -------------------------------------------------------------
  for (const trade of TRADES) {
    await page.goto(`${BASE}/research?trade=${trade}`, { waitUntil: "networkidle" });
    const cards = page.locator("article");
    const n = await cards.count();
    if (n === 0) {
      ok(`trade filter ${trade} returns a consistent (empty) view`);
      continue;
    }
    // Every visible card must belong to the filtered trade.
    const texts = await cards.allInnerTexts();
    const tradeLabel = trade === "civil" ? "Civil Engineering"
      : trade === "environmental" ? "Environmental Engineering"
      : trade.charAt(0).toUpperCase() + trade.slice(1);
    const allMatch = texts.every((t) => t.toUpperCase().includes(tradeLabel.toUpperCase()));
    if (allMatch) ok(`trade filter ${trade} returns only ${trade} items (${n})`);
    else fail(`trade filter ${trade}`, "a card from another trade leaked in");
  }

  for (const metro of METROS) {
    await page.goto(`${BASE}/research?metro=${metro}`, { waitUntil: "networkidle" });
    const n = await page.locator("article").count();
    ok(`metro filter ${metro} renders (${n} items)`);
  }

  // Combined filter must narrow, never widen.
  {
    await page.goto(`${BASE}/research?trade=hvac&metro=miami`, { waitUntil: "networkidle" });
    const combined = await page.locator("article").count();
    await page.goto(`${BASE}/research?trade=hvac`, { waitUntil: "networkidle" });
    const tradeOnly = await page.locator("article").count();
    if (combined <= tradeOnly) ok(`combined filter narrows (${combined} <= ${tradeOnly})`);
    else fail("combined filter narrows", `${combined} > ${tradeOnly}`);
  }

  // A bad filter value must not blank the page.
  {
    await page.goto(`${BASE}/research?trade=notatrade`, { waitUntil: "networkidle" });
    const heading = await page.locator("header h1").first().textContent();
    if (heading?.includes("Vertical Research")) ok("unknown filter value degrades gracefully");
    else fail("unknown filter value degrades gracefully", `got "${heading}"`);
  }

  // --- mobile --------------------------------------------------------------
  // "No horizontal scroll" is NOT sufficient on its own: a fixed sidebar can
  // eat two thirds of a phone screen while the page still reports no overflow,
  // which is exactly how the rail shipped broken once. Assert usable width too.
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/research", "/research?trade=hvac", "/research/civil"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow <= 1) ok(`${path} has no horizontal scroll at 375px`);
    else fail(`${path} horizontal scroll at 375px`, `${overflow}px overflow`);

    const mainWidth = await page
      .locator("main")
      .evaluate((el) => el.getBoundingClientRect().width);
    if (mainWidth >= 355) {
      ok(`${path} gives main the full width at 375px (${Math.round(mainWidth)}px)`);
    } else {
      fail(
        `${path} gives main the full width at 375px`,
        `main is only ${Math.round(mainWidth)}px — the sidebar is stealing the viewport`,
      );
    }
  }

  // --- mobile drawer opens, navigates, and dismisses -------------------------
  await page.goto(`${BASE}/research`, { waitUntil: "networkidle" });
  const railHidden = await page
    .locator('[data-testid="sidebar"]')
    .evaluate((el) => el.getBoundingClientRect().right <= 1);
  if (railHidden) ok("sidebar is off-canvas at 375px");
  else fail("sidebar is off-canvas at 375px", "it is occupying the viewport");

  await page.click('button[title="Open navigation"]');
  await page.waitForTimeout(350);
  const drawerVisible = await page
    .locator('[data-testid="sidebar"]')
    .evaluate((el) => el.getBoundingClientRect().left >= -1);
  if (drawerVisible) ok("hamburger opens the mobile drawer");
  else fail("hamburger opens the mobile drawer");

  await page.click('a[href="/deals"]');
  await page.waitForURL(`${BASE}/deals`, { timeout: 15000 });
  await page.waitForTimeout(400);
  const drawerClosed = await page
    .locator('[data-testid="sidebar"]')
    .evaluate((el) => el.getBoundingClientRect().right <= 1);
  if (drawerClosed) ok("drawer closes after navigating from it");
  else fail("drawer closes after navigating from it", "it stayed over the page");

  await page.close();
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
