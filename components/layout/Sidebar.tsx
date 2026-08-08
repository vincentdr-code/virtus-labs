"use client";
import { useState } from "react";
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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/*
       * Below lg the rail would take two thirds of a phone screen, so it
       * becomes an off-canvas drawer and this button is the only thing left
       * on screen. It hides itself once the drawer is open.
       */}
      <button
        onClick={() => setMobileOpen(true)}
        title="Open navigation"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className={`fixed left-4 top-6 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-c-border bg-bg-secondary text-text-secondary transition-opacity duration-200 hover:text-text-primary lg:hidden ${
          mobileOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        data-testid="sidebar"
        className={`flex w-64 flex-col overflow-y-auto border-r border-c-border bg-navy transition-transform duration-200
          fixed inset-y-0 left-0 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:z-auto lg:min-h-screen lg:shrink-0 lg:translate-x-0`}
      >
        <div className="flex items-start justify-between border-b border-c-border px-6 pb-7 pt-9">
          <TailorSentLockup size={32} />
          <button
            onClick={() => setMobileOpen(false)}
            title="Close navigation"
            aria-label="Close navigation"
            className="mt-1 text-text-tertiary transition-colors hover:text-text-primary lg:hidden"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 py-5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                // Dismiss on navigation so the drawer does not sit on top of
                // the page the user just asked for.
                onClick={() => setMobileOpen(false)}
                // Active state is a gold rail rather than a filled pill: gold
                // is the brand accent, and a saturated blue block competes
                // with the mark instead of pointing at the current page.
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

        <div className="border-t border-c-border px-4 py-5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] font-medium text-text-tertiary transition-colors duration-200 hover:bg-bg-tertiary hover:text-text-primary"
          >
            <LogOut size={18} strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
