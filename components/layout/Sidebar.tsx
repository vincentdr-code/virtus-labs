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
import { TailorSentLockup } from "@/components/brand/TailorSentMark";

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
      <div className="px-6 pt-9 pb-7 border-b border-c-border">
        <TailorSentLockup size={32} />
      </div>
      <nav className="flex-1 py-5 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              // Active state is a gold rail rather than a filled pill: gold is
              // the brand accent, and a saturated blue block competes with the
              // mark instead of pointing at the current page.
              className={`flex items-center gap-3.5 border-l-[3px] py-3 pl-4 pr-4 text-[15px] transition-colors duration-200 ${
                active
                  ? "border-gold-bright bg-gold/10 font-bold text-gold-bright"
                  : "border-transparent font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
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
