"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { useDiagnostic } from "@/context/diagnostic-context";
import { NeuralLoader } from "@/components/ui/neural-loader";

const PREPROCESS_STAGES = [
  { id: "original", label: "Original", ms: 0 },
  { id: "noise", label: "Noise Reduction", ms: 12 },
  { id: "skull", label: "Skull Stripping", ms: 18 },
  { id: "contrast", label: "Contrast Enhancement", ms: 14 },
  { id: "normalized", label: "Normalized", ms: 9 },
];

export function PreprocessStep({ onComplete }: { onComplete: () => void }) {
  const { previewUrl } = useDiagnostic();
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        const next = p + 4;
        setActiveStage(Math.min(Math.floor(next / 25), 4));
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-4 md:gap-4">
        {PREPROCESS_STAGES.map((stage, i) => (
          <div key={stage.id} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="glass-card w-28 p-2 text-center sm:w-36"
            >
              <div className="relative mx-auto mb-2 h-16 w-16 overflow-hidden rounded-lg bg-bg-elevated">
                {previewUrl && (
                  <Image src={previewUrl} alt={stage.label} fill className="object-cover opacity-80" />
                )}
                {i <= activeStage && i > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-accent-emerald/30">
                    <Check className="h-6 w-6 text-accent-emerald" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium">{stage.label}</p>
              {stage.ms > 0 && (
                <span className="mt-1 inline-block rounded bg-accent-emerald/15 px-1.5 text-[10px] text-accent-emerald">
                  {stage.ms}ms
                </span>
              )}
            </motion.div>
            {i < PREPROCESS_STAGES.length - 1 && (
              <div className="mx-1 hidden h-0.5 w-6 bg-border sm:block md:w-10">
                <motion.div
                  className="h-full bg-accent-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: i < activeStage ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Preprocessing pipeline</span>
          <span className="font-mono text-accent-cyan">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-blue to-accent-violet"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          ETA: {Math.max(0, Math.ceil((100 - progress) * 0.05))}s
        </p>
      </div>
      {progress < 100 && <NeuralLoader message="Applying skull stripping and normalization..." />}
    </div>
  );
}

export function FeatureExtractionStep({ onComplete }: { onComplete: () => void }) {
  const [localBar, setLocalBar] = useState(0);
  const [globalBar, setGlobalBar] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLocalBar((b) => Math.min(b + 8, 92));
      setGlobalBar((b) => Math.min(b + 6, 88));
    }, 150);
    const done = setTimeout(onComplete, 2800);
    return () => { clearInterval(t); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-6">
        <h3 className="font-display font-bold">🔍 Local Detail Path</h3>
        <hr className="my-3 border-border" />
        <ul className="space-y-2 text-sm text-text-muted">
          <li>▸ Edge Feature Maps</li>
          <li>▸ Tumor Boundary Detect</li>
          <li>▸ Texture Analysis</li>
        </ul>
        <p className="mt-4 text-xs text-text-muted">Feature Density</p>
        <div className="mt-1 h-2 rounded-full bg-bg-elevated">
          <motion.div className="h-full rounded-full bg-accent-blue" style={{ width: `${localBar}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              className="aspect-square rounded bg-accent-blue/10"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: n * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-6">
        <h3 className="font-display font-bold">🌐 Global Context Path</h3>
        <hr className="my-3 border-border" />
        <ul className="space-y-2 text-sm text-text-muted">
          <li>▸ Spatial Context Maps</li>
          <li>▸ Tissue Distribution</li>
          <li>▸ Hemisphere Symmetry</li>
        </ul>
        <p className="mt-4 text-xs text-text-muted">Context Score</p>
        <div className="mt-1 h-2 rounded-full bg-bg-elevated">
          <motion.div className="h-full rounded-full bg-accent-violet" style={{ width: `${globalBar}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              className="aspect-square rounded bg-accent-violet/10"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: n * 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function FusionStep({ onComplete }: { onComplete: () => void }) {
  const [gateScore, setGateScore] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setGateScore((s) => Math.min(s + 5, 87)), 100);
    const done = setTimeout(onComplete, 2500);
    return () => { clearInterval(t); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div className="glass-card p-8">
      <svg viewBox="0 0 500 200" className="mx-auto w-full max-w-lg">
        <text x="40" y="40" fill="#6B7FA3" fontSize="12">Local Path</text>
        <text x="380" y="40" fill="#6B7FA3" fontSize="12">Global Path</text>
        <rect x="175" y="60" width="150" height="80" rx="8" fill="#111D3A" stroke="#4CC9F0" strokeWidth="1.5" />
        <text x="250" y="95" textAnchor="middle" fill="#E8F0FF" fontSize="11" fontWeight="bold">FUSION LAYER</text>
        <text x="250" y="115" textAnchor="middle" fill="#00D4FF" fontSize="10">Cross-Gate</text>
        <line x1="120" y1="100" x2="175" y2="100" stroke="#4CC9F0" strokeWidth="2" />
        <line x1="380" y1="100" x2="325" y2="100" stroke="#7B61FF" strokeWidth="2" />
        <line x1="250" y1="140" x2="250" y2="175" stroke="#00D4FF" strokeWidth="2" />
        <text x="250" y="190" textAnchor="middle" fill="#6B7FA3" fontSize="11">Fused Features</text>
        {[120, 180, 240].map((cx, i) => (
          <circle key={i} cx={cx} cy="100" r="4" fill="#4CC9F0" opacity={0.5 + i * 0.15} />
        ))}
      </svg>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-text-muted">Gate Activation</p>
          <p className="font-mono text-xl text-accent-cyan">{gateScore}%</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-text-muted">Fusion Confidence</p>
          <p className="font-mono text-xl text-accent-blue">94.2%</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-text-muted">Gate-Consistency Loss</p>
          <p className="font-mono text-xl">0.023</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-text-muted">Attention Map</p>
          <div className="mt-1 h-8 rounded bg-gradient-to-r from-blue-900 via-red-500 to-yellow-400 opacity-80" />
        </div>
      </div>
    </div>
  );
}
