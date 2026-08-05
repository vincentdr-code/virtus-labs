import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

/**
 * Standard empty state for tabs with no content yet — shows a clear
 * call-to-action instead of a blank page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="col-span-12 flex flex-col items-center justify-center text-center py-24 px-6 bg-bg-secondary/40 border border-dashed border-c-border rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-6">
        <Icon size={24} strokeWidth={1.5} className="text-gold" />
      </div>
      <h2 className="text-lg font-light text-text-primary tracking-wide mb-2">
        {title}
      </h2>
      <p className="text-text-tertiary text-sm font-light max-w-md mb-8">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center h-10 px-6 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-bg-primary text-sm font-medium tracking-wide transition-all duration-200"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
