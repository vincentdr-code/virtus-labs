interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
}

export function StatCard({ label, value, sub, gold = false }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
      <p className="text-text-tertiary text-[11px] font-medium uppercase tracking-wider mb-2">
        {label}
      </p>
      <p
        className={`text-3xl font-bold tabular-nums leading-none ${
          gold ? "text-gold" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-text-secondary text-xs mt-2">{sub}</p>}
    </div>
  );
}
