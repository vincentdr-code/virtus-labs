"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  FlaskConical,
  ClipboardList,
  Briefcase,
  BarChart3,
  Handshake,
  LogOut,
  Mic2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: BarChart3 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/meeting-prep", label: "Meeting Prep", icon: ClipboardList },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/consultation", label: "Consultation", icon: Mic2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-bg-primary border-r border-c-border/60 flex flex-col min-h-screen">
      <div className="px-8 pt-10 pb-8">
        <p className="text-gold font-light text-lg tracking-[0.25em] leading-none">
          CONVENIENTIA
        </p>
        <p className="text-text-tertiary text-[10px] mt-2.5 tracking-[0.35em] uppercase font-light">
          Operations
        </p>
      </div>
      <nav className="flex-1 px-5 py-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm tracking-wide transition-all duration-200 ${
                active
                  ? "bg-bg-tertiary text-gold font-medium"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary font-light"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-6 border-t border-c-border/60">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-light tracking-wide text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all duration-200"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
