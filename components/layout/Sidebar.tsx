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
    <aside className="w-56 shrink-0 bg-navy border-r border-c-border flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-c-border">
        <p className="text-gold font-bold text-lg tracking-tight leading-none">
          CONVENIENTIA
        </p>
        <p className="text-text-tertiary text-[10px] mt-1.5 tracking-widest uppercase">
          Operations
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-emerald text-text-primary font-medium"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-c-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
