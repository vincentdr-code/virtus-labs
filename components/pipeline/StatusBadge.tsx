const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RESEARCHING: {
    label: "Researching",
    color: "bg-bg-tertiary text-text-secondary border-c-border",
  },
  CONTACTED: {
    label: "Contacted",
    color: "bg-navy text-text-secondary border-c-border",
  },
  MEETING_SCHEDULED: {
    label: "Meeting Scheduled",
    color: "bg-azure/20 text-azure-bright border-azure/40",
  },
  MEETING_HELD: {
    label: "Meeting Held",
    color: "bg-azure/30 text-azure-bright border-azure/50",
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    color: "bg-gold/20 text-gold border-gold/40",
  },
  WON: {
    label: "Won",
    color: "bg-azure/40 text-text-primary border-azure/60",
  },
  LOST: {
    label: "Lost",
    color: "bg-danger/20 text-red-400 border-danger/40",
  },
  DORMANT: {
    label: "Dormant",
    color: "bg-bg-secondary text-text-tertiary border-c-border",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-bg-tertiary text-text-secondary border-c-border",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}
