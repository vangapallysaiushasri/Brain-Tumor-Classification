"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { ReportStep } from "@/components/diagnostics/steps/xai-report-steps";

export default function ClinicalReportPage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Clinical Report</h1>
        <p className="text-text-muted">Generate and export Neuro-XAI diagnostic reports</p>
      </header>
      <ReportStep />
    </PageTransition>
  );
}
