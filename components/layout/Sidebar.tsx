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
    <aside className="w-64 shrink-0 bg-navy border-r border-c-border flex flex-col min-h-screen">
      <div className="px-8 pt-9 pb-7 border-b border-c-border">
        <p className="text-gold font-bold text-xl tracking-[0.12em] leading-none">
          CONVENIENTIA
        </p>
        <p className="text-emerald-bright text-[11px] mt-2.5 tracking-[0.3em] uppercase font-semibold">
          Operations
        </p>
      </div>
      <nav className="flex-1 px-4 py-5 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
                active
                  ? "bg-emerald text-bg-primary font-bold shadow-lg shadow-emerald/25"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary font-medium"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-5 border-t border-c-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
