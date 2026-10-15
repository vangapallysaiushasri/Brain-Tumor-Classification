"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { ParticleField } from "@/components/ui/particles";
import { Chatbot } from "./chatbot";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="gradient-mesh grid-overlay min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="lg:pl-[280px]">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="relative min-h-[calc(100vh-4rem)] px-4 pb-20 pt-6 lg:px-8 lg:pb-8">
          <ParticleField count={16} />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
