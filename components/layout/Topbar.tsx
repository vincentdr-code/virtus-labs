import Link from "next/link";

interface TopbarProps {
  title: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-14 border-b border-c-border bg-bg-secondary flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center h-8 px-4 rounded-md bg-gold text-bg-primary hover:bg-gold-bright text-sm font-semibold transition-colors"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
