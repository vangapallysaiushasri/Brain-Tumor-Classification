"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useDiagnostic } from "@/context/diagnostic-context";
import { TooltipInfo } from "@/components/ui/tooltip-info";

const TABS = [
  {
    id: "gradcam" as const,
    label: "Grad-CAM",
    description:
      "Visualizes which brain regions most influenced the CNN's classification by projecting gradient signals onto the input MRI.",
    contributions: [
      { region: "Frontal lobe", pct: 34 },
      { region: "Parietal cortex", pct: 28 },
      { region: "Corpus callosum", pct: 18 },
    ],
  },
  {
    id: "shap" as const,
    label: "SHAP",
    description:
      "Uses game-theoretic Shapley values to assign each input feature a fair contribution to the predicted tumor class.",
    contributions: [
      { region: "Intensity variance", pct: 24 },
      { region: "Edge density", pct: 19 },
      { region: "GLCM contrast", pct: 15 },
    ],
  },
  {
    id: "lime" as const,
    label: "LIME",
    description:
      "Builds a local linear model around the prediction to identify superpixel regions that support or oppose the diagnosis.",
    contributions: [
      { region: "Superpixel cluster 12", pct: 42 },
      { region: "Superpixel cluster 7", pct: 28 },
      { region: "Superpixel cluster 3", pct: 15 },
    ],
  },
];

interface XAIHubProps {
  defaultTab?: "gradcam" | "shap" | "lime";
}

export function XAIHub({ defaultTab = "gradcam" }: XAIHubProps) {
  const [tab, setTab] = useState(defaultTab);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const { previewUrl, heatmap, prediction } = useDiagnostic();
  const active = TABS.find((t) => t.id === tab)!;
  const explainedImage =
    tab === "gradcam" && heatmap
      ? `data:image/png;base64,${heatmap}`
      : tab === "lime" && prediction?.lime
      ? `data:image/png;base64,${prediction.lime}`
      : tab === "shap" && prediction?.shap
      ? `data:image/png;base64,${prediction.shap}`
      : previewUrl;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue ${
              tab === t.id
                ? "bg-accent-blue/20 text-accent-cyan shadow-glow"
                : "text-text-muted hover:bg-accent-blue/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="glass-card p-4">
          <h3 className="font-display font-bold">Original MRI</h3>
          <div className="relative mt-3 aspect-video overflow-hidden rounded-lg bg-bg-elevated">
            {previewUrl ? (
              <Image src={previewUrl} alt="Original" fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                Upload a scan in MRI Diagnostics
              </div>
            )}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold">Explained — {active.label}</h3>
            <TooltipInfo term={active.label} definition={active.description} />
          </div>
          <div className="relative mt-3 aspect-video overflow-hidden rounded-lg bg-bg-elevated">
            {explainedImage ? (
              <Image src={explainedImage} alt="Explained" fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">No overlay available</div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mt-6 glass-card p-6">
        <p className="text-sm text-text-muted">{active.description}</p>
        <h4 className="mt-4 font-display font-bold">Confidence Contribution Breakdown</h4>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {active.contributions.map((c) => (
            <button
              key={c.region}
              type="button"
              onClick={() => setSelectedRegion(c.region)}
              className={`rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue ${
                selectedRegion === c.region
                  ? "border-accent-cyan bg-accent-cyan/10 shadow-glow"
                  : "border-border hover:border-accent-blue/30"
              }`}
            >
              <p className="text-sm font-medium">{c.region}</p>
              <p className="font-mono text-accent-cyan">{c.pct}%</p>
            </button>
          ))}
        </div>
        {selectedRegion && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-accent-emerald"
          >
            Highlighting: {selectedRegion} — click another region to compare contributions.
          </motion.p>
        )}
      </div>
    </div>
  );
}
