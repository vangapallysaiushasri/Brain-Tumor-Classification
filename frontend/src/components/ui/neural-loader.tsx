"use client";

import { motion } from "framer-motion";

export function NeuralLoader({ message = "Processing neural pathways..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <svg viewBox="0 0 120 80" className="h-16 w-24" aria-hidden>
        {[0, 1, 2].map((layer) => (
          <g key={layer}>
            {[0, 1, 2, 3].map((node) => (
              <motion.circle
                key={`${layer}-${node}`}
                cx={20 + layer * 40}
                cy={15 + node * 17}
                r="4"
                fill="#4CC9F0"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: layer * 0.2 + node * 0.1,
                }}
              />
            ))}
          </g>
        ))}
        <motion.line
          x1="24" y1="32" x2="56" y2="32"
          stroke="#7B61FF"
          strokeWidth="1"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.line
          x1="64" y1="32" x2="96" y2="32"
          stroke="#00D4FF"
          strokeWidth="1"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
        />
      </svg>
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
