interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
}

export function StatCard({ label, value, sub, gold = false }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-c-border rounded-2xl p-7 hover:border-azure/50 transition-colors duration-300">
      <p className="text-text-tertiary text-xs font-semibold uppercase tracking-[0.15em] mb-4">
        {label}
      </p>
      <p
        className={`text-4xl font-bold tabular-nums leading-none tracking-tight ${
          gold ? "text-gold" : "text-azure-bright"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-text-secondary text-sm mt-3">{sub}</p>}
    </div>
  );
}
