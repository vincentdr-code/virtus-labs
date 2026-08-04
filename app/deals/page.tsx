import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { getDeals, getDealsByStage } from "@/lib/actions/deals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PipelineValueChart } from "@/components/charts/PipelineValueChart";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  DISCOVERY: { label: "Discovery", color: "text-text-secondary" },
  SCOPING: { label: "Scoping", color: "text-text-secondary" },
  PROPOSAL_SENT: { label: "Proposal Sent", color: "text-gold" },
  NEGOTIATION: { label: "Negotiation", color: "text-gold" },
  WON: { label: "Won", color: "text-emerald-bright" },
  LOST: { label: "Lost", color: "text-red-400" },
};

export default async function DealsPage() {
  const [deals, chartData] = await Promise.all([getDeals(), getDealsByStage()]);
  const openPipeline = deals
    .filter((d) => !["WON", "LOST"].includes(d.stage))
    .reduce((s, d) => s + (d.valueEstimate ?? 0), 0);
  const won = deals
    .filter((d) => d.stage === "WON")
    .reduce((s, d) => s + (d.valueEstimate ?? 0), 0);

  return (
    <>
      <Topbar title="Deals" />
      <div className="p-6 max-w-5xl space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Open Pipeline
            </p>
            <p className="text-gold text-2xl font-bold tabular-nums leading-none">
              {formatCurrency(openPipeline)}
            </p>
          </div>
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Won
            </p>
            <p className="text-emerald-bright text-2xl font-bold tabular-nums leading-none">
              {formatCurrency(won)}
            </p>
          </div>
          <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
              Active Deals
            </p>
            <p className="text-text-primary text-2xl font-bold tabular-nums leading-none">
              {deals.filter((d) => !["WON", "LOST"].includes(d.stage)).length}
            </p>
          </div>
        </div>

        {chartData.length > 0 && <PipelineValueChart data={chartData} />}

        <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
          {deals.length === 0 ? (
            <p className="text-text-secondary text-sm p-6">
              No deals yet. Add one from a company&apos;s detail page.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-c-border">
                  {[
                    "Company",
                    "Service Type",
                    "Value",
                    "Stage",
                    "Expected Close",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-text-tertiary font-medium text-[11px] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => {
                  const stageConfig = STAGE_CONFIG[d.stage] ?? {
                    label: d.stage,
                    color: "text-text-secondary",
                  };
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-c-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/companies/${d.companyId}`}
                          className="text-emerald-bright hover:underline"
                        >
                          {d.company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {d.serviceType}
                      </td>
                      <td className="px-4 py-3 text-gold font-medium tabular-nums">
                        {formatCurrency(d.valueEstimate)}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${stageConfig.color}`}
                      >
                        {stageConfig.label}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {formatDate(d.expectedCloseDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
