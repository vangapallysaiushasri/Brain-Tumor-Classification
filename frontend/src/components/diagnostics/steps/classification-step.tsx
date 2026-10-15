"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useDiagnostic } from "@/context/diagnostic-context";
import { getSeverity, TUMOR_COLORS, emptyProbabilities } from "@/lib/utils";
import { ALL_TUMOR_TYPES } from "@/types";
import { TooltipInfo } from "@/components/ui/tooltip-info";

export function ClassificationStep({ onNext }: { onNext: () => void }) {
  const { prediction } = useDiagnostic();

  const probs = prediction?.probabilities ?? emptyProbabilities();
  const label = prediction?.predicted_label ?? prediction?.tumor_type ?? "Unclassified/Rare Tumor";
  const confidence = prediction?.confidence ?? 0;
  const severity = getSeverity(label);
  const isRare = label === "Unclassified/Rare Tumor";
  const isNormal = label === "No Tumor Detected";
  const showAlert = !isNormal;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mx-auto max-w-xl glass-card p-8 text-center"
    >
      <h3 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
        Classification Result
      </h3>
      <hr className="my-4 border-border" />
      <motion.p
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`font-display text-2xl font-bold ${
          isNormal ? "text-accent-emerald" : isRare ? "text-orange-400" : "text-accent-rose"
        }`}
      >
        {isNormal ? "✅" : isRare ? "⚠️" : "🔴"} {label.toUpperCase()}
        {showAlert && !isRare ? " DETECTED" : ""}
      </motion.p>
      <p className="mt-2 font-mono text-accent-cyan">
        Confidence: {(confidence * 100).toFixed(1)}%
      </p>
      {prediction?.message && (
        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
          {prediction.message}
        </p>
      )}
      <span
        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
          severity === "High"
            ? "bg-accent-rose/20 text-accent-rose"
            : severity === "Medium"
            ? "bg-orange-500/20 text-orange-400"
            : severity === "Low-Medium"
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-accent-emerald/20 text-accent-emerald"
        }`}
      >
        Severity: {severity}
      </span>

      <div className="relative mx-auto my-6 h-28 w-28">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#111D3A" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#4CC9F0"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={264}
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 264 - 264 * confidence }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold">
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>

      <p className="mb-3 text-left text-sm text-text-muted">Probability Distribution (8 tumor types)</p>
      <div className="max-h-64 space-y-2 overflow-y-auto text-left">
        {ALL_TUMOR_TYPES.map((cls) => {
          const pct = (probs[cls] ?? 0) * 100;
          return (
            <div key={cls}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="truncate pr-2">{cls}</span>
                <span className="font-mono shrink-0">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: TUMOR_COLORS[cls] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={onNext}>
          View Explainability
        </button>
        <Link href="/explainability/grad-cam" className="btn-secondary">
          Deep Dive XAI
        </Link>
      </div>
      <p className="mt-4 text-xs text-text-muted">
        Cross-Gated Attention Fusion
        <TooltipInfo
          term="Cross-Gated Attention"
          definition="Fuses local detail and global context feature paths through learnable gating mechanisms for improved tumor localization."
        />
      </p>
    </motion.div>
  );
}
