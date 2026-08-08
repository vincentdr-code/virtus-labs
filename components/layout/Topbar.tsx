import Link from "next/link";

interface TopbarProps {
  title: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    // pl-16 below lg reserves room for the sidebar's floating hamburger.
    <header className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-c-border bg-bg-secondary pl-16 pr-4 lg:px-10">
      <h1 className="truncate text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
        {title}
      </h1>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full bg-gold px-5 text-sm font-bold tracking-wide text-bg-primary shadow-lg shadow-gold/20 transition-colors hover:bg-gold-bright sm:px-6"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
