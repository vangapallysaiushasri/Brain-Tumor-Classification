"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Upload",
  "Preprocess",
  "Features",
  "Fusion",
  "Classify",
  "XAI",
  "Report",
];

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-[640px] items-center justify-between px-2">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    done && "border-accent-emerald bg-accent-emerald/20 text-accent-emerald",
                    active && "border-accent-cyan bg-accent-cyan/20 text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.4)]",
                    !done && !active && "border-border text-text-muted"
                  )}
                  animate={active ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
                >
                  {done ? <Check className="h-5 w-5" /> : step}
                </motion.div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    active ? "text-accent-cyan" : "text-text-muted"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded",
                    done ? "bg-accent-emerald/60" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
