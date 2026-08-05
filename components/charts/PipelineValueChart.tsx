"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DealPoint {
  stage: string;
  value: number;
}

// Token references, not literals — the chart follows the palette in
// globals.css instead of drifting on its own copy of the colors.
const STAGE_COLORS: Record<string, string> = {
  DISCOVERY: "var(--text-tertiary)",
  SCOPING: "var(--text-secondary)",
  PROPOSAL_SENT: "var(--gold)",
  NEGOTIATION: "var(--gold-bright)",
  WON: "var(--emerald-bright)",
};

const STAGE_LABELS: Record<string, string> = {
  DISCOVERY: "Discovery",
  SCOPING: "Scoping",
  PROPOSAL_SENT: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
};

export function PipelineValueChart({ data }: { data: DealPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: STAGE_LABELS[d.stage] ?? d.stage,
  }));

  return (
    <div className="bg-bg-secondary border border-c-border rounded-lg p-5">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Value by Stage
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{
              fill: "color-mix(in srgb, var(--bg-tertiary) 40%, transparent)",
            }}
            contentStyle={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--c-border)",
              borderRadius: 6,
              color: "var(--text-primary)",
              fontSize: 12,
            }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Value",
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((d) => (
              <Cell
                key={d.stage}
                fill={STAGE_COLORS[d.stage] ?? "var(--bg-tertiary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
