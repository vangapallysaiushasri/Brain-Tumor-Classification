"use client";

import { Menu, Bell, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/diagnostics": "MRI Diagnostics",
  "/explainability": "Explainability",
  "/explainability/grad-cam": "Grad-CAM Heatmaps",
  "/explainability/shap": "SHAP Attribution",
  "/explainability/lime": "LIME Explanations",
  "/analytics": "Model Analytics",
  "/report": "Clinical Report",
  "/history": "History Logs",
  "/settings": "Settings",
};

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [
    { label: "Neuro-XAI", href: "/" },
    ...segments.map((seg, i) => {
      const path = "/" + segments.slice(0, i + 1).join("/");
      return { label: routeLabels[path] || seg.replace(/-/g, " "), href: path };
    }),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary backdrop-blur-glass">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-blue/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-text-muted" />}
                <Link
                  href={crumb.href}
                  className={
                    i === crumbs.length - 1
                      ? "font-medium text-text-primary"
                      : "text-text-muted hover:text-accent-blue"
                  }
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
            {pathname === "/diagnostics" && (
              <>
                <ChevronRight className="h-3 w-3 text-text-muted" />
                <Link
                  href="/diagnostics"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.reload();
                  }}
                  className="text-accent-cyan hover:text-accent-cyan/80 font-medium"
                >
                  ← New Scan
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-accent-blue/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-rose" />
          </button>
          {user ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-xs font-bold text-bg-primary">
                {user.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-text-muted">{user.specialization}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="ml-2 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-blue/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
