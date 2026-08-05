#!/usr/bin/env node
/**
 * Color-token drift check.
 *
 * The palette is defined once in app/globals.css. Any hardcoded hex color
 * in app/ or components/ bypasses the token system and will silently
 * drift the color scheme — this script fails CI when one appears.
 *
 * Allowed: app/globals.css (the token file itself) and the PWA manifest /
 * layout theme-color entries, which the web platform requires as literals.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN_DIRS = ["app", "components"];
const ALLOWED_FILES = new Set([
  "app/globals.css",
  "app/manifest.ts", // manifest spec requires literal colors
  "app/layout.tsx", // themeColor viewport export requires a literal
  // Prompt text describing the *generated client prototype's* palette —
  // not part of this app's UI color system.
  "app/api/consultation/analyze/route.ts",
]);
const HEX_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(tsx?|css|mjs)$/.test(entry)) yield full;
  }
}

let failures = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    if (ALLOWED_FILES.has(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const matches = line.match(HEX_RE);
      if (matches) {
        failures++;
        console.error(`${rel}:${i + 1}  hardcoded ${matches.join(", ")}`);
      }
    });
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} hardcoded hex color(s) found — use tokens from app/globals.css instead.`
  );
  process.exit(1);
}
console.log("color tokens OK — no hardcoded hex outside the token file");
