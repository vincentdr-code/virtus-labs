"use client";

export interface AnalysisData {
  painPoints?: string[];
  currentTools?: string[];
  solution?: {
    name: string;
    tagline: string;
    features: Array<{ name: string; description: string }>;
  };
  estimatedScope?: string;
  prototypeHtml?: string;
}

interface Props {
  data: AnalysisData | null;
  analyzing: boolean;
}

export function PrototypeBrief({ data, analyzing }: Props) {
  if (!data && !analyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-tertiary text-sm text-center p-6 bg-bg-secondary border border-c-border rounded-lg">
        <p className="text-text-tertiary mb-2 text-2xl font-light">[ ]</p>
        <p>Prototype builds here as the client speaks.</p>
        <p className="text-xs mt-1">
          Claude filters out small talk and builds from business content only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyzing && (
        <div className="flex items-center gap-2 text-xs text-gold bg-bg-secondary border border-c-border rounded-lg px-4 py-2">
          <span className="animate-pulse">●</span>
          <span>Claude is building the prototype...</span>
        </div>
      )}

      {data?.prototypeHtml && (
        <div className="bg-bg-secondary border border-c-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-c-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Live Prototype
            </p>
            {data.solution?.name && (
              <span className="text-gold text-xs font-semibold">
                {data.solution.name}
              </span>
            )}
          </div>
          <iframe
            srcDoc={data.prototypeHtml}
            className="w-full border-0"
            style={{ height: "420px" }}
            sandbox="allow-scripts"
            title="Live prototype"
          />
        </div>
      )}

      {data?.painPoints && data.painPoints.length > 0 && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Pain Points Captured (Their Words)
          </p>
          <ul className="space-y-1">
            {data.painPoints.map((p, i) => (
              <li key={i} className="text-text-primary text-sm flex gap-2">
                <span className="text-gold shrink-0">·</span>
                <span>&quot;{p}&quot;</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data?.solution?.features && data.solution.features.length > 0 && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Features Identified
          </p>
          <ol className="space-y-1">
            {data.solution.features.map((f, i) => (
              <li key={i} className="text-sm flex gap-3">
                <span className="text-gold font-bold tabular-nums shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-text-primary font-medium">{f.name}</span>
                  <span className="text-text-secondary"> — {f.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {data?.estimatedScope && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Estimated Scope
          </p>
          <p className="text-gold font-semibold">{data.estimatedScope}</p>
        </div>
      )}
    </div>
  );
}
