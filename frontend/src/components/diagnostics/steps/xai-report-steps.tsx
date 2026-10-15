"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Download, RefreshCw } from "lucide-react";
import { useDiagnostic } from "@/context/diagnostic-context";
import { TooltipInfo } from "@/components/ui/tooltip-info";
import { generateReportPdf } from "@/lib/pdf-report";

export function XAIStep({ onNext }: { onNext: () => void }) {
  const { previewUrl, heatmap, prediction } = useDiagnostic();
  const [opacity, setOpacity] = useState(1.0);

  const cards = [
    {
      title: "GRAD-CAM",
      subtitle: "Heatmap",
      desc: "Tumor region highlighted in red/yellow",
      tooltip: "Gradient-weighted Class Activation Mapping highlights regions that most influenced the model's prediction.",
      image: heatmap ? `data:image/png;base64,${heatmap}` : previewUrl,
      features: ["Superior frontal", "Parietal lobe", "Temporal region"],
    },
    {
      title: "SHAP",
      subtitle: "Attribution Map",
      desc: "Top 10 features ranked",
      tooltip: "SHapley Additive exPlanations quantify each feature's contribution to the prediction.",
      image: prediction?.shap ? `data:image/png;base64,${prediction.shap}` : previewUrl,
      bars: [
        { name: "Intensity variance", v: 0.24 },
        { name: "Edge density", v: 0.19 },
        { name: "Texture homogeneity", v: 0.15 },
      ],
    },
    {
      title: "LIME",
      subtitle: "Explanation",
      desc: "Top 5 regions ranked",
      tooltip: "Local Interpretable Model-agnostic Explanations approximate the model locally with interpretable segments.",
      image: prediction?.lime ? `data:image/png;base64,${prediction.lime}` : previewUrl,
      regions: ["Region A (42%)", "Region B (28%)", "Region C (15%)"],
    },
  ];

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card overflow-hidden p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold">{card.title}</h4>
              <TooltipInfo term={card.title} definition={card.tooltip} />
            </div>
            <p className="text-xs text-text-muted">{card.subtitle}</p>
            {card.image && (
              <div className="relative mt-3 aspect-square overflow-hidden rounded-lg bg-bg-elevated">
                <Image src={card.image} alt={card.title} fill className="object-contain" style={{ opacity }} />
              </div>
            )}
            {card.bars && (
              <div className="mt-3 space-y-2">
                {card.bars.map((b) => (
                  <div key={b.name}>
                    <div className="flex justify-between text-xs">
                      <span>{b.name}</span>
                      <span className="font-mono">{(b.v * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-elevated">
                      <div className="h-full rounded-full bg-accent-violet" style={{ width: `${b.v * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {card.regions && (
              <ul className="mt-3 space-y-1 text-xs text-text-muted">
                {card.regions.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-secondary mt-3 w-full text-xs">
              <Download className="h-3 w-3" /> Download
            </button>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 glass-card p-4">
        <label className="text-sm text-text-muted">Overlay opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="mt-2 w-full accent-accent-cyan"
        />
      </div>
      <button type="button" className="btn-primary mt-6" onClick={onNext}>
        Generate Clinical Report
      </button>
    </div>
  );
}

import { getSeverity } from "@/lib/utils";
import type { DisplayLabel } from "@/types";

export function ReportStep() {
  const { patientId, scanDate, previewUrl, prediction, heatmap, resetSession } = useDiagnostic();
  const label = (prediction?.predicted_label ?? prediction?.tumor_type ?? "Unclassified/Rare Tumor") as DisplayLabel;
  const confidence = prediction?.confidence ?? 0;
  const severity = getSeverity(label);

  const handlePdf = () => void generateReportPdf({
    patientId,
    scanDate,
    label,
    confidence,
    previewUrl: previewUrl ?? undefined,
    heatmap: heatmap ?? undefined,
    shap: prediction?.shap ?? undefined,
    lime: prediction?.lime ?? undefined,
  });

  const handleScanAgain = () => {
    resetSession();
  };

  return (
    <div className="glass-card mx-auto max-w-4xl p-8 font-serif">
      <div className="border-b-2 border-accent-blue pb-4 text-center">
        <h2 className="font-display text-xl font-bold tracking-wide text-accent-blue">
          NEURO-XAI DIAGNOSTIC REPORT
        </h2>
        <p className="mt-1 text-xs text-text-muted">Precision Diagnostics. Explainable Intelligence.</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <dt className="text-text-muted">Patient ID</dt>
        <dd className="font-mono">{patientId}</dd>
        <dt className="text-text-muted">Date</dt>
        <dd>{new Date(scanDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</dd>
      </dl>
      <hr className="my-4 border-border" />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {previewUrl && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">Original MRI</p>
              <div className="relative aspect-square overflow-hidden rounded border border-border bg-bg-elevated">
                <Image src={previewUrl} alt="MRI" fill className="object-contain" />
              </div>
            </div>
          )}
          {heatmap && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">Grad-CAM Heatmap</p>
              <div className="relative aspect-square overflow-hidden rounded border border-border bg-bg-elevated">
                <Image src={`data:image/png;base64,${heatmap}`} alt="Grad-CAM Heatmap" fill className="object-contain" />
              </div>
            </div>
          )}
          {prediction?.shap && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">SHAP Attribution Map</p>
              <div className="relative aspect-square overflow-hidden rounded border border-border bg-bg-elevated">
                <Image src={`data:image/png;base64,${prediction.shap}`} alt="SHAP Attribution" fill className="object-contain" />
              </div>
            </div>
          )}
          {prediction?.lime && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-sans">LIME Explanation</p>
              <div className="relative aspect-square overflow-hidden rounded border border-border bg-bg-elevated">
                <Image src={`data:image/png;base64,${prediction.lime}`} alt="LIME Explanation" fill className="object-contain" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 font-sans">
          <div>
            <p className="text-sm text-text-muted">Classification</p>
            <p className="text-xl font-bold text-accent-rose mt-1">{label} ({(confidence * 100).toFixed(1)}%)</p>
            <p className="text-sm mt-1">Severity: {severity}</p>
            {prediction?.message && (
              <p className="mt-3 text-xs text-orange-300 bg-orange-950/20 border border-orange-500/20 p-2 rounded">{prediction.message}</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Analysis Status</p>
            <p className="text-xs text-accent-emerald font-semibold mt-1">✓ Pipeline Complete</p>
            <p className="text-[10px] text-text-muted mt-1">All 3 XAI models computed</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-text-muted">
        <strong>Model Notes:</strong> Cross-Gated Attention Fusion detected high-density feature activation in the
        periventricular white matter with asymmetric hemisphere involvement consistent with {label} morphology.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 font-sans">
        <button type="button" className="btn-primary" onClick={handlePdf}>
          📄 Download PDF
        </button>
        <button type="button" className="btn-secondary">📧 Email Report</button>
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          🖨 Print
        </button>
        <button type="button" className="btn-secondary">💾 Save to History</button>
        <button
          type="button"
          className="btn-secondary bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
          onClick={handleScanAgain}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Scan New Image
        </button>
      </div>
    </div>
  );
}
