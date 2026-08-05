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
  Microscope,
  Send,
  Wallet,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Cosmas",
    items: [{ href: "/cosmas", label: "COSMAS Pipeline", icon: Microscope }],
  },
  {
    label: "Consulting",
    items: [
      { href: "/pipeline", label: "Pipeline", icon: BarChart3 },
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/deals", label: "Deals", icon: Handshake },
      { href: "/projects", label: "Projects", icon: Briefcase },
      { href: "/consultation", label: "Consultation", icon: Mic2 },
    ],
  },
  {
    label: "Prospecting",
    items: [
      { href: "/outreach", label: "Outreach", icon: Send },
      { href: "/contacts", label: "Contacts", icon: Users },
      { href: "/meeting-prep", label: "Meeting Prep", icon: ClipboardList },
    ],
  },
  {
    label: "Intelligence",
    items: [{ href: "/research", label: "Research", icon: FlaskConical }],
  },
  {
    label: "Operations",
    items: [
      { href: "/financials", label: "Financials", icon: Wallet },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: hamburger. Hidden once the drawer is open. */}
      <button
        onClick={() => setMobileOpen(true)}
        title="Open navigation"
        aria-label="Open navigation"
        className={`lg:hidden fixed top-5 left-4 z-40 w-10 h-10 rounded-xl bg-bg-secondary border border-c-border/60 flex items-center justify-center text-text-secondary hover:text-text-primary transition-opacity duration-200 ${
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {/* Mobile: backdrop behind the open drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        data-testid="sidebar"
        className={`bg-bg-primary border-r border-c-border/60 flex flex-col transition-all duration-200
          fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:shrink-0 lg:min-h-screen lg:z-auto
          ${collapsed ? "lg:w-[68px]" : "lg:w-64"}`}
      >
        {/* Collapse only applies from lg up — the mobile drawer is always
            full width with labels, so every collapsed style is lg-prefixed. */}
        <div
          className={`pt-10 pb-6 flex items-start px-8 justify-between ${
            collapsed ? "lg:px-0 lg:justify-center" : ""
          }`}
        >
          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="text-gold font-light text-lg tracking-[0.25em] leading-none">
              CONVENIENTIA
            </p>
            <p className="text-text-tertiary text-[10px] mt-2.5 tracking-[0.35em] uppercase font-light">
              Operations
            </p>
          </div>
          {/* Desktop: collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:block text-text-tertiary hover:text-text-primary transition-colors duration-200 mt-0.5"
          >
            {collapsed ? (
              <PanelLeftOpen size={16} strokeWidth={1.5} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.5} />
            )}
          </button>
          {/* Mobile: close drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            title="Close navigation"
            aria-label="Close navigation"
            className="lg:hidden text-text-tertiary hover:text-text-primary transition-colors duration-200 mt-0.5"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <nav
          className={`flex-1 py-2 space-y-5 overflow-y-auto px-5 ${
            collapsed ? "lg:px-3" : ""
          }`}
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label ?? gi}>
              {group.label && (
                <p
                  className={`px-4 mb-1.5 text-[10px] font-medium text-text-tertiary uppercase tracking-[0.25em] ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href ||
                    (href !== "/" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      // Dismiss the mobile drawer on navigation so it does
                      // not sit on top of the page the user just opened.
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? label : undefined}
                      className={`flex items-center gap-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 px-4 py-2.5 ${
                        collapsed ? "lg:justify-center lg:px-0" : ""
                      } ${
                        active
                          ? "bg-bg-tertiary text-gold font-medium"
                          : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary font-light"
                      }`}
                    >
                      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                      <span className={collapsed ? "lg:hidden" : ""}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div
          className={`py-6 border-t border-c-border/60 px-5 ${
            collapsed ? "lg:px-3" : ""
          }`}
        >
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-3.5 rounded-xl text-sm font-light tracking-wide text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all duration-200 px-4 py-2.5 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
