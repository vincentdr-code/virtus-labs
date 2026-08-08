import { formatDate } from "@/lib/utils";
import type { Interaction, Contact } from "@/types";

type Item = Interaction & { contact: Contact | null };

const TYPE_LABELS: Record<string, string> = {
  RESEARCH: "Research",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  PROPOSAL: "Proposal",
  FOLLOW_UP: "Follow-up",
};

export function InteractionList({ interactions }: { interactions: Item[] }) {
  if (interactions.length === 0) {
    return (
      <p className="text-text-tertiary text-sm">No interactions logged yet.</p>
    );
  }
  return (
    <ol className="relative border-l border-c-border ml-2 space-y-6 mt-2">
      {interactions.map((i) => (
        <li key={i.id} className="ml-6">
          <div className="absolute -left-[7px] mt-1 w-3.5 h-3.5 rounded-full bg-azure border-2 border-bg-primary" />
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-medium text-azure-bright">
              {TYPE_LABELS[i.type] ?? i.type}
            </span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-tertiary">{formatDate(i.date)}</span>
            {i.contact && (
              <>
                <span className="text-text-tertiary">·</span>
                <span className="text-text-tertiary">{i.contact.name}</span>
              </>
            )}
          </div>
          {i.notes && <p className="text-text-secondary text-sm">{i.notes}</p>}
          {i.insightDelivered && (
            <div className="mt-2 pl-3 border-l-2 border-gold/60">
              <p className="text-[10px] uppercase tracking-wider text-gold font-medium">
                Insight delivered
              </p>
              <p className="text-text-secondary text-sm mt-0.5">
                {i.insightDelivered}
              </p>
            </div>
          )}
          {i.outcome && (
            <p className="text-text-tertiary text-xs mt-2">
              Outcome: {i.outcome}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
