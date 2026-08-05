#!/usr/bin/env tsx
/**
 * Run a research scan from the command line.
 *
 *   npm run research:scan            # scan + send the digest
 *   npm run research:scan -- --dry   # scan only, no email
 *   npm run research:scan -- --email-only  # re-send last 7 days, no fetching
 *
 * The weekly schedule calls the HTTP endpoint instead; this is for testing
 * and for a manual catch-up run.
 */
import "dotenv/config";
import { runScan } from "../lib/research/ingest";
import { collectDigestItems, sendDigest } from "../lib/research/digest";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const emailOnly = args.includes("--email-only");

async function main() {
  if (!emailOnly) {
    console.log("Running research scan…\n");
    const summary = await runScan();
    console.log(`  sources ok:     ${summary.sourcesOk}`);
    console.log(`  sources failed: ${summary.sourcesFailed}`);
    console.log(`  items found:    ${summary.itemsFound}`);
    console.log(`  items new:      ${summary.itemsNew}`);
    if (summary.failures.length) {
      console.log("\n  failures:");
      for (const f of summary.failures) {
        console.log(`    - ${f.sourceId}: ${f.error}`);
      }
    }
  }

  if (dry) {
    console.log("\n--dry: skipping email.");
    return;
  }

  const items = await collectDigestItems(7);
  console.log(`\nDigest covers ${items.length} item(s) from the last 7 days.`);
  const result = await sendDigest(items);
  if (result.sent) {
    console.log(`Email sent to ${process.env.DIGEST_TO_EMAIL} (${result.messageId})`);
  } else if (result.skipped) {
    console.log(`Email skipped: ${result.skipped}`);
  } else {
    console.error(`Email failed: ${result.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
