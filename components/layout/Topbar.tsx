import Link from "next/link";

interface TopbarProps {
  title: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-20 border-b border-c-border bg-bg-secondary flex items-center justify-between px-10 shrink-0">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {title}
      </h1>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center h-11 px-6 rounded-full bg-gold text-bg-primary hover:bg-gold-bright text-sm font-bold tracking-wide transition-colors shadow-lg shadow-gold/20"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
