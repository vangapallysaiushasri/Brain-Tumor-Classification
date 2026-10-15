"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { XAIHub } from "@/components/explainability/xai-hub";

export default function GradCamPage() {
  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Grad-CAM Heatmaps</h1>
        <p className="text-text-muted">Visual attribution for CNN decision regions</p>
      </header>
      <XAIHub defaultTab="gradcam" />
    </PageTransition>
  );
}
