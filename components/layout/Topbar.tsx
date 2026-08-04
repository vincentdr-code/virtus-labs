import Link from "next/link";

interface TopbarProps {
  title: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-20 border-b border-c-border/60 bg-bg-primary/80 backdrop-blur flex items-center justify-between px-10 shrink-0">
      <h1 className="text-xl font-light tracking-wide text-text-primary">
        {title}
      </h1>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center h-10 px-6 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-bg-primary text-sm font-medium tracking-wide transition-all duration-200"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
