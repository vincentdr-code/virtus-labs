import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { VerticalCard } from "@/components/research/VerticalCard";
import { FilterPills } from "@/components/research/FilterPills";
import { NewsCard } from "@/components/research/NewsCard";
import { getVerticals } from "@/lib/actions/research";
import { getFeedCounts, getLatestScan, getNewsItems } from "@/lib/actions/news";
import { ENABLED_SOURCES } from "@/lib/research/sources";
import { getMetro, getTrade } from "@/lib/research/taxonomy";
import { formatDate } from "@/lib/utils";

// The feed changes between builds, so this page must never be prerendered.
export const dynamic = "force-dynamic";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string; metro?: string }>;
}) {
  const { trade, metro } = await searchParams;

  const [verticals, items, counts, lastScan] = await Promise.all([
    getVerticals(),
    getNewsItems({ trade, metro }),
    getFeedCounts(),
    getLatestScan(),
  ]);

  const tradeName = trade ? getTrade(trade)?.name : undefined;
  const metroName = metro ? getMetro(metro)?.name : undefined;
  const filterLabel = [tradeName, metroName].filter(Boolean).join(" · ");

  return (
    <>
      <Topbar title="Vertical Research" />
      <div className="max-w-6xl space-y-10 p-6 sm:p-10">
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="max-w-2xl text-sm text-text-secondary">
              Seven trades across Austin, Northern Virginia, and Miami. The feed
              below refreshes weekly from{" "}
              <span className="text-text-primary">
                {ENABLED_SOURCES.length} free sources
              </span>{" "}
              — federal rulemaking, research journals, municipal permit data, and
              trade press.
            </p>
            <ScanStatus scan={lastScan} />
          </div>

          <FilterPills activeTrade={trade} activeMetro={metro} counts={counts} />
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-c-border pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Feed{filterLabel && <span className="text-gold"> — {filterLabel}</span>}
            </h2>
            <span className="text-xs tabular-nums text-text-tertiary">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-3">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyFeed hasFilter={Boolean(trade || metro)} scanned={Boolean(lastScan)} />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-c-border pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Trade Library
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {verticals.map((v) => (
              <VerticalCard key={v.id} vertical={v} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ScanStatus({
  scan,
}: {
  scan: Awaited<ReturnType<typeof getLatestScan>>;
}) {
  if (!scan) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
        <Clock size={13} /> No scan yet
      </span>
    );
  }
  const failed = scan.status === "FAILED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        failed ? "text-danger" : "text-text-tertiary"
      }`}
    >
      {failed ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
      Last scan {formatDate(scan.startedAt)}
      {!failed && ` · ${scan.itemsNew} new`}
      {scan.emailSent && " · emailed"}
    </span>
  );
}

function EmptyFeed({
  hasFilter,
  scanned,
}: {
  hasFilter: boolean;
  scanned: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-c-border bg-bg-secondary/50 p-8 text-center">
      <p className="text-sm text-text-secondary">
        {hasFilter
          ? "Nothing matches this filter yet."
          : scanned
            ? "The last scan found nothing new."
            : "No items yet — the first weekly scan has not run."}
      </p>
      <p className="mt-1 text-xs text-text-tertiary">
        {hasFilter
          ? "Try a broader trade or market."
          : "Scans run weekly and email a digest of what changed."}
      </p>
    </div>
  );
}
