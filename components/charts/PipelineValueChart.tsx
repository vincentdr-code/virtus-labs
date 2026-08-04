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

const STAGE_COLORS: Record<string, string> = {
  DISCOVERY: "#6B7D75",
  SCOPING: "#A8B8B0",
  PROPOSAL_SENT: "#C9A24B",
  NEGOTIATION: "#E4C878",
  WON: "#16A374",
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
            tick={{ fill: "#6B7D75", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6B7D75", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: "rgba(30,61,51,0.4)" }}
            contentStyle={{
              background: "#0F2B24",
              border: "1px solid #1E3D33",
              borderRadius: 6,
              color: "#F2F0E8",
              fontSize: 12,
            }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Value",
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((d) => (
              <Cell key={d.stage} fill={STAGE_COLORS[d.stage] ?? "#1E3D33"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
