import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { NewsCard } from "@/components/research/NewsCard";
import { getVertical } from "@/lib/actions/research";
import { getNewsForVertical } from "@/lib/actions/news";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * The seed writes per-metro intelligence into `notes` as a small markdown-ish
 * block. Parsing it here keeps the metro breakdown structured in the UI
 * without adding a column that only this page would read.
 */
interface MetroSection {
  title: string;
  lines: string[];
}

export function parseMetroSections(notes: string | null): {
  preamble: string;
  sections: MetroSection[];
} {
  if (!notes) return { preamble: "", sections: [] };
  const parts = notes.split(/^## /m);
  const preamble = parts[0]?.trim() ?? "";
  const sections = parts.slice(1).map((block) => {
    const [title, ...rest] = block.split("\n");
    return {
      title: title.trim(),
      lines: rest.map((l) => l.trimEnd()).filter((l) => l.trim().length > 0),
    };
  });
  return { preamble, sections };
}

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical: slug } = await params;
  const v = await getVertical(slug);
  if (!v) notFound();

  const painPoints: string[] = v.keyPainPoints
    ? JSON.parse(v.keyPainPoints)
    : [];
  const { preamble, sections } = parseMetroSections(v.notes);
  const recent = await getNewsForVertical(slug, 6);

  return (
    <>
      <Topbar title={v.verticalName} />
      <div className="max-w-5xl space-y-6 p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wider text-text-tertiary">
            Last updated {formatDate(v.lastUpdated)}
          </span>
          <Link
            href={`/research?trade=${slug}`}
            className="text-xs text-emerald-bright hover:text-gold-bright"
          >
            See all {v.verticalName} items in the feed →
          </Link>
        </div>

        {recent.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Recent in this trade
            </h2>
            <div className="grid gap-3">
              {recent.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {painPoints.length > 0 && (
          <Panel title="Key Pain Points">
            <ol className="space-y-3">
              {painPoints.map((p, i) => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="mt-0.5 shrink-0 font-bold tabular-nums text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed text-text-primary">{p}</span>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {sections.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              By Market
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg border border-c-border border-t-2 border-t-gold bg-bg-secondary p-5"
                >
                  <h3 className="mb-3 text-sm font-bold tracking-wide text-gold-bright">
                    {section.title}
                  </h3>
                  <div className="space-y-1.5 text-sm leading-relaxed">
                    {section.lines.map((line, i) => {
                      const trimmed = line.trimStart();
                      const bullet = trimmed.startsWith("- ");
                      const isLabel = trimmed.endsWith(":");
                      // "Who to call" is the actionable line on this card —
                      // give it its own treatment rather than letting it read
                      // as one more paragraph.
                      if (trimmed.startsWith("Who to call:")) {
                        return (
                          <div
                            key={i}
                            className="mt-3 rounded border border-emerald/30 bg-bg-tertiary/60 p-3"
                          >
                            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-emerald-bright">
                              Who to call
                            </p>
                            <p className="text-text-primary">
                              {trimmed.slice("Who to call:".length).trim()}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p
                          key={i}
                          className={
                            bullet
                              ? "pl-3 text-text-secondary before:mr-2 before:text-emerald before:content-['·']"
                              : isLabel
                                ? "pt-2 text-[10px] uppercase tracking-[0.14em] text-text-tertiary"
                                : "text-text-primary"
                          }
                        >
                          {bullet ? trimmed.slice(2) : line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {v.recentDevelopments && (
          <Panel title="Recent Developments">
            <p className="text-sm leading-relaxed text-text-primary">
              {v.recentDevelopments}
            </p>
          </Panel>
        )}

        {v.targetBuyerProfile && (
          <Panel title="Target Buyer Profile">
            <p className="text-sm leading-relaxed text-text-primary">
              {v.targetBuyerProfile}
            </p>
          </Panel>
        )}

        {v.marketSize && (
          <Panel title="Market Size">
            <p className="text-sm leading-relaxed text-text-primary">
              {v.marketSize}
            </p>
          </Panel>
        )}

        {preamble && (
          <p className="text-xs italic leading-relaxed text-text-tertiary">
            {preamble}
          </p>
        )}
      </div>
    </>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-c-border bg-bg-secondary p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h2>
      {children}
    </div>
  );
}
