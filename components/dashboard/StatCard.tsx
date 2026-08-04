interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
}

export function StatCard({ label, value, sub, gold = false }: StatCardProps) {
  return (
    <div className="bg-bg-secondary/60 border border-c-border/60 rounded-2xl p-7 hover:border-gold/30 transition-colors duration-300">
      <p className="text-text-tertiary text-[11px] font-medium uppercase tracking-[0.18em] mb-4">
        {label}
      </p>
      <p
        className={`text-4xl font-light tabular-nums leading-none tracking-tight ${
          gold ? "text-gold" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-text-tertiary text-xs mt-3 font-light">{sub}</p>}
    </div>
  );
}
