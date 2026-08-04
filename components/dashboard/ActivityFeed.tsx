import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Interaction, Company, Contact } from "@/types";

type ActivityItem = Interaction & {
  company: Company;
  contact: Contact | null;
};

const TYPE_LABELS: Record<string, string> = {
  RESEARCH: "Researched",
  CALL: "Called",
  EMAIL: "Emailed",
  MEETING: "Met with",
  PROPOSAL: "Sent proposal to",
  FOLLOW_UP: "Followed up with",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-text-tertiary text-sm">No recent activity.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 text-sm">
          <span className="text-text-tertiary shrink-0 w-24">
            {formatDate(item.date)}
          </span>
          <div className="flex-1">
            <span className="text-text-secondary">
              <span className="text-text-primary font-medium">
                {TYPE_LABELS[item.type] ?? item.type}
              </span>{" "}
              <Link
                href={`/companies/${item.companyId}`}
                className="text-emerald-bright hover:underline"
              >
                {item.company.name}
              </Link>
              {item.contact && (
                <span className="text-text-tertiary"> · {item.contact.name}</span>
              )}
            </span>
            {item.insightDelivered && (
              <p className="text-text-tertiary text-xs mt-1 italic">
                ↳ {item.insightDelivered}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
