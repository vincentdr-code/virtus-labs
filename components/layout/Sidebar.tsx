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

  return (
    <aside
      className={`shrink-0 bg-bg-primary border-r border-c-border/60 flex flex-col min-h-screen transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      <div
        className={`pt-10 pb-6 flex items-start ${
          collapsed ? "px-0 justify-center" : "px-8 justify-between"
        }`}
      >
        {!collapsed && (
          <div>
            <p className="text-gold font-light text-lg tracking-[0.25em] leading-none">
              CONVENIENTIA
            </p>
            <p className="text-text-tertiary text-[10px] mt-2.5 tracking-[0.35em] uppercase font-light">
              Operations
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-text-tertiary hover:text-text-primary transition-colors duration-200 mt-0.5"
        >
          {collapsed ? (
            <PanelLeftOpen size={16} strokeWidth={1.5} />
          ) : (
            <PanelLeftClose size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <nav
        className={`flex-1 py-2 space-y-5 overflow-y-auto ${
          collapsed ? "px-3" : "px-5"
        }`}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? gi}>
            {group.label && !collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-medium text-text-tertiary uppercase tracking-[0.25em]">
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
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 ${
                      collapsed
                        ? "justify-center px-0 py-2.5"
                        : "px-4 py-2.5"
                    } ${
                      active
                        ? "bg-bg-tertiary text-gold font-medium"
                        : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary font-light"
                    }`}
                  >
                    <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                    {!collapsed && label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div
        className={`py-6 border-t border-c-border/60 ${
          collapsed ? "px-3" : "px-5"
        }`}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3.5 rounded-xl text-sm font-light tracking-wide text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all duration-200 ${
            collapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"
          }`}
        >
          <LogOut size={16} strokeWidth={1.5} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
