import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { VerticalResearch } from "@/types";

export function VerticalCard({ vertical }: { vertical: VerticalResearch }) {
  const painPoints: string[] = vertical.keyPainPoints
    ? JSON.parse(vertical.keyPainPoints)
    : [];

  return (
    <Link href={`/research/${vertical.slug}`} className="block group">
      <div className="bg-bg-secondary border border-c-border rounded-lg p-5 hover:bg-bg-tertiary transition-colors h-full">
        <div className="flex items-start justify-between mb-2 gap-3">
          <h3 className="font-semibold text-text-primary group-hover:text-emerald-bright">
            {vertical.verticalName}
          </h3>
          <span className="text-text-tertiary text-[10px] shrink-0 uppercase tracking-wider">
            {formatDate(vertical.lastUpdated)}
          </span>
        </div>
        {painPoints.length > 0 && (
          <ul className="space-y-1.5 mt-3">
            {painPoints.slice(0, 2).map((p, i) => (
              <li key={i} className="text-text-secondary text-xs flex gap-2">
                <span className="text-emerald mt-0.5 shrink-0">·</span>
                <span className="line-clamp-2">{p}</span>
              </li>
            ))}
            {painPoints.length > 2 && (
              <li className="text-text-tertiary text-xs pl-4">
                + {painPoints.length - 2} more
              </li>
            )}
          </ul>
        )}
      </div>
    </Link>
  );
}
