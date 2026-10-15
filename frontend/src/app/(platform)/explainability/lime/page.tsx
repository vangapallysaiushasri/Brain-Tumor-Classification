"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { XAIHub } from "@/components/explainability/xai-hub";

export default function LimePage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">LIME Explanations</h1>
        <p className="text-text-muted">Local interpretable model-agnostic regions</p>
      </header>
      <XAIHub defaultTab="lime" />
    </PageTransition>
  );
}
