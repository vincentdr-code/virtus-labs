#!/usr/bin/env tsx
/**
 * Probe every source in the registry and report which are actually reachable.
 *
 * Run this on the deployment box, not in a sandbox — restricted egress will
 * make every host look dead. Use it after adding a source, and whenever the
 * weekly scan reports failures.
 *
 *   npm run verify:sources           # all sources
 *   npm run verify:sources openalex  # only ids containing "openalex"
 */
import "dotenv/config";
import { ENABLED_SOURCES } from "../lib/research/sources";
import { fetchSource } from "../lib/research/fetchers";

async function main() {
  const filter = process.argv[2];
  const targets = filter
    ? ENABLED_SOURCES.filter((s) => s.id.includes(filter))
    : ENABLED_SOURCES;

  console.log(`Probing ${targets.length} source(s)…\n`);

  let ok = 0;
  let dead = 0;
  const failures: Array<{ id: string; reason: string }> = [];

  for (const source of targets) {
    const result = await fetchSource(source);
    const label = source.id.padEnd(26);
    const tier = source.tier.padEnd(15);

    if (result.ok && result.items.length > 0) {
      ok++;
      console.log(
        `OK    ${label} ${tier} ${String(result.items.length).padStart(3)} items  ${result.durationMs}ms`,
      );
      console.log(`      └ "${result.items[0].headline.slice(0, 70)}"`);
    } else if (result.ok) {
      // Reachable but empty is suspicious — usually a changed feed shape.
      dead++;
      failures.push({ id: source.id, reason: "reachable but parsed 0 items" });
      console.log(`EMPTY ${label} ${tier} reachable but parsed 0 items`);
    } else {
      dead++;
      failures.push({ id: source.id, reason: result.error ?? "unknown" });
      console.log(`FAIL  ${label} ${tier} ${result.error}`);
    }
  }

  console.log(`\n${ok} working, ${dead} failing`);
  if (failures.length) {
    console.log("\nSet `enabled: false` on these in lib/research/sources.ts:");
    for (const f of failures) console.log(`  - ${f.id}: ${f.reason}`);
  }
  process.exit(dead > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
