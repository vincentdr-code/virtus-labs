import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { CATEGORIES, getTrade, METROS } from "./taxonomy";
import { rankItems } from "./scoring";

export interface DigestItem {
  id: string;
  trade: string;
  metro: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceTier: string;
  category: string;
  importance: number;
  publishedAt: Date;
}

const APP_URL = process.env.NEXTAUTH_URL ?? "https://virtus-labs.duckdns.org";

// Matches the app's own palette so the email reads as part of the product.
const COLORS = {
  ink: "#0A1613",
  panel: "#101F1A",
  rule: "#22463A",
  parchment: "#F7F5EF",
  sage: "#B8CCC2",
  sageDim: "#7E948A",
  emerald: "#2BE895",
  gold: "#E8B54A",
};

/** Pull the items a digest should cover: anything added since the last one. */
export async function collectDigestItems(sinceDays = 7): Promise<DigestItem[]> {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const items = await prisma.newsItem.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { publishedAt: "desc" },
  });
  return items as DigestItem[];
}

/**
 * Group by metro for the email body. The three target markets come first and
 * in a fixed order; national items land in their own trailing section so they
 * never crowd out the local ones.
 */
export function groupByMetro(items: DigestItem[]) {
  const groups: Array<{ slug: string; name: string; items: DigestItem[] }> = [];
  for (const metro of METROS) {
    const inMetro = items.filter((i) => i.metro === metro.slug);
    if (inMetro.length) {
      groups.push({
        slug: metro.slug,
        name: `${metro.name}, ${metro.state}`,
        items: rankItems(inMetro),
      });
    }
  }
  const national = items.filter((i) => i.metro === "national");
  if (national.length) {
    groups.push({
      slug: "national",
      name: "National / cross-market",
      items: rankItems(national).slice(0, 12),
    });
  }
  return groups;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Storage slugs are terse ("ma"); the email shows the taxonomy label. */
function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

function itemHtml(item: DigestItem): string {
  const trade = getTrade(item.trade)?.name ?? item.trade;
  const flag =
    item.importance >= 3
      ? `<span style="background:${COLORS.gold};color:${COLORS.ink};font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.06em;">WORTH FLAGGING</span>`
      : "";
  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid ${COLORS.rule};">
        <div style="font-size:11px;color:${COLORS.sageDim};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
          ${escapeHtml(trade)} &middot; ${escapeHtml(categoryLabel(item.category))} ${flag}
        </div>
        <a href="${escapeHtml(item.sourceUrl)}"
           style="color:${COLORS.parchment};font-size:16px;font-weight:600;text-decoration:none;line-height:1.4;">
          ${escapeHtml(item.headline)}
        </a>
        <div style="color:${COLORS.sage};font-size:14px;line-height:1.6;margin-top:6px;">
          ${escapeHtml(item.summary)}
        </div>
        <div style="color:${COLORS.sageDim};font-size:12px;margin-top:6px;">
          ${escapeHtml(item.sourceName)}
        </div>
      </td>
    </tr>`;
}

export function renderDigestHtml(items: DigestItem[]): string {
  const groups = groupByMetro(items);
  const flagged = items.filter((i) => i.importance >= 3).length;
  const dateLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const sections = groups
    .map(
      (group) => `
      <tr><td style="padding:28px 0 4px;">
        <div style="color:${COLORS.gold};font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-bottom:2px solid ${COLORS.emerald};padding-bottom:8px;">
          ${escapeHtml(group.name)} <span style="color:${COLORS.sageDim};font-weight:400;">(${group.items.length})</span>
        </div>
      </td></tr>
      ${group.items.map(itemHtml).join("")}`,
    )
    .join("");

  const empty = `
    <tr><td style="padding:32px 0;color:${COLORS.sage};font-size:15px;">
      No new items this week. Either the sources were quiet or a feed is failing —
      check the scan log at <a href="${APP_URL}/research" style="color:${COLORS.emerald};">${APP_URL}/research</a>.
    </td></tr>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${COLORS.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.ink};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="max-width:640px;background:${COLORS.panel};border:1px solid ${COLORS.rule};border-radius:6px;padding:28px 28px 32px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      <tr><td>
        <div style="color:${COLORS.gold};font-size:18px;font-weight:300;letter-spacing:0.22em;">VIRTUS LABS</div>
        <div style="color:${COLORS.sageDim};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;">Weekly Research Digest</div>
        <div style="color:${COLORS.sage};font-size:13px;margin-top:14px;">
          ${dateLabel} &middot; ${items.length} new item${items.length === 1 ? "" : "s"}${
            flagged ? ` &middot; <strong style="color:${COLORS.gold};">${flagged} worth flagging</strong>` : ""
          }
        </div>
      </td></tr>
      ${items.length ? sections : empty}
      <tr><td style="padding-top:28px;border-top:1px solid ${COLORS.rule};">
        <a href="${APP_URL}/research"
           style="display:inline-block;background:${COLORS.gold};color:${COLORS.ink};font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:4px;">
          Open the research library
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Plain-text alternative — some clients prefer it, and it is a fallback. */
export function renderDigestText(items: DigestItem[]): string {
  const groups = groupByMetro(items);
  if (!items.length) {
    return `Virtus Labs weekly research digest\n\nNo new items this week.\n\n${APP_URL}/research`;
  }
  const body = groups
    .map((group) => {
      const lines = group.items
        .map((i) => {
          const flag = i.importance >= 3 ? " [WORTH FLAGGING]" : "";
          const trade = getTrade(i.trade)?.name ?? i.trade;
          return `- ${i.headline}${flag}\n  ${trade} | ${i.sourceName}\n  ${i.summary}\n  ${i.sourceUrl}`;
        })
        .join("\n\n");
      return `${group.name.toUpperCase()} (${group.items.length})\n${"-".repeat(40)}\n${lines}`;
    })
    .join("\n\n");
  return `VIRTUS LABS — WEEKLY RESEARCH DIGEST\n${items.length} new items\n\n${body}\n\nOpen the library: ${APP_URL}/research`;
}

export interface SendResult {
  sent: boolean;
  skipped?: string;
  messageId?: string;
  error?: string;
}

/**
 * Send the digest over SMTP. Credentials live in env; if they are missing the
 * digest is skipped rather than treated as a failure, so a scan on a box with
 * no mail configured still succeeds.
 */
export async function sendDigest(items: DigestItem[]): Promise<SendResult> {
  const to = process.env.DIGEST_TO_EMAIL;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!to) return { sent: false, skipped: "DIGEST_TO_EMAIL not set" };
  if (!host || !user || !pass) {
    return { sent: false, skipped: "SMTP_HOST/USER/PASS not configured" };
  }

  // Only stay silent when there is genuinely nothing AND nothing to warn about.
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const flagged = items.filter((i) => i.importance >= 3).length;
  const subject = items.length
    ? `Virtus Labs research — ${items.length} new${flagged ? `, ${flagged} to flag` : ""}`
    : "Virtus Labs research — quiet week";

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `Virtus Labs Research <${user}>`,
      to,
      subject,
      text: renderDigestText(items),
      html: renderDigestHtml(items),
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
