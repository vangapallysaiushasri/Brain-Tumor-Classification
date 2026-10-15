"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Microscope,
  Eye,
  BarChart3,
  FileText,
  History,
  Settings,
  ChevronDown,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { NeuroLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type NavItem =
  | { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
  | {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      children: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
    };

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diagnostics", label: "MRI Diagnostics", icon: Microscope },
  {
    label: "Explainability",
    icon: Eye,
    children: [
      { href: "/explainability/grad-cam", label: "Grad-CAM Heatmaps", icon: GraduationCap },
      { href: "/explainability/shap", label: "SHAP Attribution", icon: Layers },
      { href: "/explainability/lime", label: "LIME Explanations", icon: Sparkles },
    ],
  },
  { href: "/analytics", label: "Model Analytics", icon: BarChart3 },
  { href: "/report", label: "Clinical Report", icon: FileText },
  { href: "/history", label: "History Logs", icon: History },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [xaiOpen, setXaiOpen] = useState(
    pathname.startsWith("/explainability")
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavLink = ({
    href,
    label,
    icon: Icon,
    nested = false,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    nested?: boolean;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onMobileClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          nested && "pl-9 text-xs",
          active
            ? "neon-border-active text-text-primary"
            : "text-text-muted hover:bg-accent-blue/5 hover:text-text-primary"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-all",
            active ? "text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" : "group-hover:text-accent-blue"
          )}
        />
        <span className="truncate">{label}</span>
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 -z-10 rounded-lg"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      <div className="border-b border-border px-4 py-5">
        <Link href="/" className="block">
          <NeuroLogo />
        </Link>
        <p className="mt-2 text-[11px] italic text-text-muted">
          Precision Diagnostics. Explainable Intelligence.
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if ("children" in item && item.children) {
            const open = xaiOpen || item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setXaiOpen(!xaiOpen)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-accent-blue/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
                    open && "text-text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                  />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-0.5 border-l border-border/50 ml-5 pl-2">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            href={child.href}
                            label={child.label}
                            icon={child.icon}
                            nested
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          if (!("href" in item)) return null;
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          );
        })}
      </nav>

      <div className="border-t border-border space-y-1 px-3 py-4">
        <NavLink href="/settings" label="Settings" icon={Settings} />
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-accent-blue/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
        >
          <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
          <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col border-r border-border bg-bg-card backdrop-blur-glass lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-bg-card lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile icon bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-border bg-bg-card backdrop-blur-glass lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const href = "href" in item ? item.href : "/explainability/grad-cam";
          const Icon = item.icon;
          const active = isActive(href);
          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center p-2 text-[10px]",
                active ? "text-accent-cyan" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </aside>
    </>
  );
}
