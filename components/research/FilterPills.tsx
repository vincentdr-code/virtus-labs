import Link from "next/link";
import { METROS, TRADES } from "@/lib/research/taxonomy";

interface FilterPillsProps {
  activeTrade?: string;
  activeMetro?: string;
  counts: {
    trades: Record<string, number>;
    metros: Record<string, number>;
  };
}

/**
 * Filters are links rather than client-side state so the page stays a server
 * component and a filtered view is shareable and bookmarkable.
 */
function buildHref(trade?: string, metro?: string) {
  const params = new URLSearchParams();
  if (trade) params.set("trade", trade);
  if (metro) params.set("metro", metro);
  const qs = params.toString();
  return qs ? `/research?${qs}` : "/research";
}

function Pill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      data-active={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs tracking-wide transition-colors duration-150 ${
        active
          ? "border-gold bg-gold text-bg-primary font-semibold"
          : "border-c-border text-text-secondary hover:border-emerald hover:text-text-primary"
      }`}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={`tabular-nums text-[10px] ${
            active ? "text-bg-primary/70" : "text-text-tertiary"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function FilterPills({
  activeTrade,
  activeMetro,
  counts,
}: FilterPillsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Market
        </span>
        <Pill
          href={buildHref(activeTrade, undefined)}
          active={!activeMetro}
          label="All markets"
        />
        {METROS.map((metro) => (
          <Pill
            key={metro.slug}
            href={buildHref(activeTrade, metro.slug)}
            active={activeMetro === metro.slug}
            label={metro.name}
            count={counts.metros[metro.slug]}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Trade
        </span>
        <Pill
          href={buildHref(undefined, activeMetro)}
          active={!activeTrade}
          label="All trades"
        />
        {TRADES.map((trade) => (
          <Pill
            key={trade.slug}
            href={buildHref(trade.slug, activeMetro)}
            active={activeTrade === trade.slug}
            label={trade.name}
            count={counts.trades[trade.slug]}
          />
        ))}
      </div>
    </div>
  );
}
