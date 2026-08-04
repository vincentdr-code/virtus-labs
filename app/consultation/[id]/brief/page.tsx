import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { PrintButton } from "@/components/consultation/PrintButton";
import { getConsultationSession } from "@/lib/actions/consultation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Feature {
  name: string;
  description: string;
}
interface InsightsData {
  painPoints?: string[];
  currentTools?: string[];
  solution?: { name: string; tagline: string; features: Feature[] };
  estimatedScope?: string;
}

function parseInsights(json: string | null): InsightsData {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default async function ConsultationBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getConsultationSession(id);
  if (!session) notFound();

  const insights = parseInsights(session.insights);

  return (
    <>
      <Topbar
        title="Consultation Prototype"
        action={{ label: "All Sessions", href: "/consultation" }}
      />
      <div className="p-10 max-w-4xl space-y-8 print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gold font-bold text-xs uppercase tracking-widest">
              CONVENIENTIA
            </p>
            <h1 className="text-2xl font-bold text-text-primary mt-1">
              {session.title}
            </h1>
            {session.clientName && (
              <p className="text-text-secondary text-sm mt-0.5">
                {session.clientName}
              </p>
            )}
            {session.company && (
              <p className="text-text-secondary text-sm">
                {session.company.name}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-text-tertiary text-xs">
              {formatDate(session.createdAt)}
            </p>
            <PrintButton />
          </div>
        </div>

        {/* THE PROTOTYPE — hero element */}
        {session.prototypeHtml ? (
          <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-c-border">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wider">
                  Your Prototype
                </p>
                {insights.solution?.name && (
                  <p className="text-gold font-bold text-lg leading-tight">
                    {insights.solution.name}
                  </p>
                )}
                {insights.solution?.tagline && (
                  <p className="text-text-secondary text-xs italic">
                    {insights.solution.tagline}
                  </p>
                )}
              </div>
              <span className="text-xs text-emerald-bright border border-emerald/30 rounded px-2 py-1">
                Built from your words
              </span>
            </div>
            <iframe
              srcDoc={session.prototypeHtml}
              className="w-full border-0"
              style={{ height: "560px" }}
              sandbox="allow-scripts"
              title="Software prototype"
            />
          </div>
        ) : (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-8 text-center">
            <p className="text-text-tertiary text-sm">
              No prototype generated — the recording may have been too short.
            </p>
          </div>
        )}

        {/* Pain points */}
        {insights.painPoints && insights.painPoints.length > 0 && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              The Problem (In Your Words)
            </h2>
            <ol className="space-y-2">
              {insights.painPoints.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-gold font-bold shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-text-primary">&quot;{p}&quot;</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Features */}
        {insights.solution?.features && insights.solution.features.length > 0 && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Feature Blueprint
            </h2>
            <ol className="space-y-3">
              {insights.solution.features.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-gold font-bold tabular-nums shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-text-primary font-semibold">{f.name}</p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {f.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {insights.currentTools && insights.currentTools.length > 0 && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Systems We&apos;d Replace / Integrate
            </h2>
            <div className="flex flex-wrap gap-2">
              {insights.currentTools.map((t, i) => (
                <span
                  key={i}
                  className="bg-bg-tertiary border border-c-border text-text-secondary text-xs rounded px-3 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {insights.estimatedScope && (
          <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Investment Estimate
            </h2>
            <p className="text-gold text-lg font-bold">
              {insights.estimatedScope}
            </p>
          </div>
        )}

        {session.transcript && (
          <details className="bg-bg-secondary border border-c-border rounded-lg p-5 print:hidden">
            <summary className="text-xs text-text-tertiary cursor-pointer select-none">
              View full transcript
            </summary>
            <p className="text-text-secondary text-xs mt-3 leading-relaxed whitespace-pre-wrap">
              {session.transcript}
            </p>
          </details>
        )}

        <Link
          href="/consultation"
          className="block text-emerald-bright text-sm hover:underline print:hidden"
        >
          Back to sessions
        </Link>
      </div>
    </>
  );
}
