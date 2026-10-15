"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { TooltipInfo } from "@/components/ui/tooltip-info";

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">
          Model Performance — Cross-Gated Multi-Path Attention Fusion
        </h1>
        <p className="text-text-muted">
          Evaluation metrics on 7,153 MRI slices (held-out test set)
          <TooltipInfo
            term="Gate-Consistency Loss"
            definition="Auxiliary loss that encourages stable gating weights between local and global feature paths during training."
          />
        </p>
      </header>
      <AnalyticsDashboard />
    </PageTransition>
  );
}
