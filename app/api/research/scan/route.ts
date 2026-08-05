import { NextResponse } from "next/server";
import { runScan } from "@/lib/research/ingest";
import { collectDigestItems, sendDigest } from "@/lib/research/digest";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Trigger a research scan and send the weekly digest.
 *
 * Called two ways:
 *   - the scheduled weekly job, authenticated with the CRON_SECRET bearer token
 *   - a signed-in user pressing "Run scan now" in the UI
 *
 * Anything else is rejected: this endpoint spends API budget and sends mail.
 */
export async function POST(request: Request) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runScan();
    const items = await collectDigestItems(7);
    const mail = await sendDigest(items);

    if (mail.sent) {
      await prisma.scanRun.update({
        where: { id: summary.runId },
        data: { emailSent: true },
      });
    }

    return NextResponse.json({
      ok: true,
      ...summary,
      digest: {
        itemCount: items.length,
        emailSent: mail.sent,
        skipped: mail.skipped,
        error: mail.error,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

async function isAuthorized(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret && header === `Bearer ${secret}`) return true;

  const session = await auth();
  return Boolean(session?.user);
}
