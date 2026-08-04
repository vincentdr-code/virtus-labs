import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { getVertical } from "@/lib/actions/research";
import { formatDate } from "@/lib/utils";

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

  return (
    <>
      <Topbar title={v.verticalName} />
      <div className="p-10 max-w-3xl space-y-6">
        <div className="text-xs text-text-tertiary uppercase tracking-wider">
          Last updated {formatDate(v.lastUpdated)}
        </div>

        {painPoints.length > 0 && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Key Pain Points
            </h2>
            <ol className="space-y-3">
              {painPoints.map((p, i) => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="text-gold font-bold tabular-nums shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-text-primary leading-relaxed">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {v.recentDevelopments && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Recent Developments
            </h2>
            <p className="text-text-primary text-sm leading-relaxed">
              {v.recentDevelopments}
            </p>
          </div>
        )}

        {v.targetBuyerProfile && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Target Buyer Profile
            </h2>
            <p className="text-text-primary text-sm leading-relaxed">
              {v.targetBuyerProfile}
            </p>
          </div>
        )}

        {v.marketSize && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Market Size
            </h2>
            <p className="text-text-primary text-sm leading-relaxed">
              {v.marketSize}
            </p>
          </div>
        )}

        {v.notes && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Notes
            </h2>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
              {v.notes}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
