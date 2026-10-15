"use client";

import { useTheme } from "next-themes";
import { PageTransition } from "@/components/layout/page-transition";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-text-muted">Platform preferences and API configuration</p>
      </header>
      <div className="max-w-xl space-y-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-bold">Appearance</h3>
          <p className="mt-1 text-sm text-text-muted">Premium dark theme with optional light mode</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 rounded-lg border py-3 transition-all focus-visible:ring-2 focus-visible:ring-accent-blue ${
                theme === "dark" ? "border-accent-cyan bg-accent-cyan/10" : "border-border"
              }`}
            >
              🌙 Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 rounded-lg border py-3 transition-all focus-visible:ring-2 focus-visible:ring-accent-blue ${
                theme === "light" ? "border-accent-cyan bg-accent-cyan/10" : "border-border"
              }`}
            >
              ☀️ Light
            </button>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-bold">API Endpoint</h3>
          <p className="mt-1 text-sm text-text-muted">Flask backend for inference and Grad-CAM</p>
          <input
            className="input-field mt-3 font-mono text-xs"
            readOnly
            value={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
          />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-bold">Model</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-text-muted">Architecture</dt><dd>EfficientNet-B0 + Cross-Gated Attention</dd></div>
            <div className="flex justify-between"><dt className="text-text-muted">Classes</dt><dd>8 tumor types + rare/unclassified fallback</dd></div>
            <div className="flex justify-between"><dt className="text-text-muted">Version</dt><dd className="font-mono">1.0.0</dd></div>
          </dl>
        </div>
      </div>
    </PageTransition>
  );
}
