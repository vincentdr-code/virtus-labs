import { cn } from "@/lib/utils";

/**
 * 12-column responsive page grid. Children place themselves with
 * col-span-* utilities (e.g. "col-span-12 lg:col-span-8").
 * Replaces the old fixed `max-w-*` page containers so content
 * scales with the viewport instead of floating in margin.
 */
export function PageGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("page-grid", className)}>{children}</div>;
}
