import type {
  Company,
  Contact,
  Interaction,
  Deal,
  VerticalResearch,
} from "@/types";
import { StatusBadge } from "@/components/pipeline/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";

type Props = {
  company: Company & {
    contacts: Contact[];
    interactions: Interaction[];
    deals: Deal[];
  };
  research: VerticalResearch | null;
};

export function PrepSheet({ company, research }: Props) {
  const painPoints: string[] = research?.keyPainPoints
    ? JSON.parse(research.keyPainPoints)
    : [];
  const decisionMakers = company.contacts.filter((c) => c.isDecisionMaker);
  const latestInteraction = company.interactions[0];
  const previouslyDelivered = company.interactions
    .filter((i) => i.insightDelivered)
    .map((i) => i.insightDelivered as string);
  const activeDeal = company.deals[0];
  const openingHook =
    painPoints.find(
      (p) => !previouslyDelivered.some((d) => d.toLowerCase().includes(p.toLowerCase().split(" ")[0])),
    ) ?? painPoints[0];

  return (
    <div className="space-y-5">
      <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            The Company
          </h2>
          <StatusBadge status={company.status} />
        </div>
        <h3 className="text-xl font-bold text-text-primary">{company.name}</h3>
        <p className="text-text-secondary text-sm mt-1">
          {company.vertical}
          {company.subVertical && ` · ${company.subVertical}`}
          {company.location && ` · ${company.location}`}
          {company.size && ` · ${company.size} employees`}
        </p>
        {company.archaicSignalNotes && (
          <div className="mt-4 p-3 bg-bg-tertiary rounded border-l-2 border-gold">
            <p className="text-[10px] text-gold font-medium mb-1 uppercase tracking-wider">
              Their Archaic Signal
            </p>
            <p className="text-text-primary text-sm">
              {company.archaicSignalNotes}
            </p>
          </div>
        )}
      </div>

      {decisionMakers.length > 0 && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Decision Makers
          </h2>
          <div className="space-y-3">
            {decisionMakers.map((c) => (
              <div key={c.id}>
                <p className="font-medium text-text-primary">
                  {c.name}
                  <span className="text-text-tertiary font-normal text-xs ml-2">
                    · {c.title}
                  </span>
                </p>
                {c.email && (
                  <p className="text-azure-bright text-xs mt-0.5">
                    {c.email}
                  </p>
                )}
                {c.notes && (
                  <p className="text-text-tertiary text-xs mt-1 italic">
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {painPoints.length > 0 && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Vertical Pain Points — What to Teach
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

      {previouslyDelivered.length > 0 && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Already Delivered — Don&apos;t Repeat
          </h2>
          <ul className="space-y-2">
            {previouslyDelivered.map((insight, i) => (
              <li key={i} className="text-text-secondary text-sm flex gap-2">
                <span className="text-azure mt-0.5">✓</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {latestInteraction && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Last Interaction
          </h2>
          <p className="text-text-tertiary text-xs mb-2 uppercase tracking-wider">
            {formatDate(latestInteraction.date)} · {latestInteraction.type}
          </p>
          {latestInteraction.notes && (
            <p className="text-text-primary text-sm leading-relaxed">
              {latestInteraction.notes}
            </p>
          )}
          {latestInteraction.outcome && (
            <p className="text-text-secondary text-sm mt-2">
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Outcome
              </span>{" "}
              — {latestInteraction.outcome}
            </p>
          )}
        </div>
      )}

      {activeDeal && (
        <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Open Deal
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-text-primary font-medium">
                {activeDeal.serviceType}
              </p>
              <p className="text-text-tertiary text-xs mt-0.5">
                {activeDeal.stage.replace("_", " ")}
                {activeDeal.expectedCloseDate &&
                  ` · Expected close ${formatDate(activeDeal.expectedCloseDate)}`}
              </p>
            </div>
            <p className="text-gold text-2xl font-bold tabular-nums">
              {formatCurrency(activeDeal.valueEstimate)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-navy border border-gold/30 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
          Suggested Opening
        </h2>
        <p className="text-text-primary text-sm leading-relaxed">
          &ldquo;I was researching {company.vertical.toLowerCase()} companies
          and noticed{" "}
          {company.archaicSignalNotes
            ? `you're ${company.archaicSignalNotes.split(".")[0].toLowerCase()}`
            : "a pattern that's showing up across your space"}
          . I&apos;ve been working with companies like yours on their
          operational bottlenecks. Before I ask about your situation,
          here&apos;s something we&apos;re seeing across the market —{" "}
          {openingHook ?? "a key operational gap"}. Does that resonate with
          what you&apos;re dealing with?&rdquo;
        </p>
      </div>
    </div>
  );
}
