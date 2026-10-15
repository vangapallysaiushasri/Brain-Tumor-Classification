"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { XAIHub } from "@/components/explainability/xai-hub";

export default function ShapPage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">SHAP Attribution</h1>
        <p className="text-text-muted">Feature-level contribution analysis</p>
      </header>
      <XAIHub defaultTab="shap" />
    </PageTransition>
  );
}
