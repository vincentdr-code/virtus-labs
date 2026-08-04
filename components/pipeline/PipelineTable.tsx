import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Company, Contact, Deal } from "@/types";

type Row = Company & {
  contacts: Contact[];
  deals: Deal[];
  _count: { interactions: number };
};

export function PipelineTable({ companies }: { companies: Row[] }) {
  if (companies.length === 0) {
    return (
      <p className="text-text-secondary text-sm p-6">
        No companies yet. Add one to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-c-border">
            {[
              "Company",
              "Vertical",
              "Status",
              "Deal Value",
              "Contacts",
              "Interactions",
              "Last Updated",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-text-tertiary font-medium text-[11px] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr
              key={c.id}
              className="border-b border-c-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/companies/${c.id}`}
                  className="text-text-primary font-medium hover:text-emerald-bright"
                >
                  {c.name}
                </Link>
                {c.location && (
                  <p className="text-text-tertiary text-xs">{c.location}</p>
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {c.vertical}
                {c.subVertical && (
                  <p className="text-text-tertiary text-xs">{c.subVertical}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3 tabular-nums">
                {c.deals.length > 0 ? (
                  <span className="text-gold font-medium">
                    {formatCurrency(
                      c.deals.reduce((s, d) => s + (d.valueEstimate ?? 0), 0),
                    )}
                  </span>
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary tabular-nums">
                {c.contacts.length}
              </td>
              <td className="px-4 py-3 text-text-secondary tabular-nums">
                {c._count.interactions}
              </td>
              <td className="px-4 py-3 text-text-tertiary text-xs">
                {formatDate(c.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
