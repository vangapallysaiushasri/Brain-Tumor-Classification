"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipInfoProps {
  term: string;
  definition: string;
}

export function TooltipInfo({ term, definition }: TooltipInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="ml-1 rounded-full p-0.5 text-text-muted transition-colors hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Info about ${term}`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-bg-elevated p-3 text-xs shadow-glow"
          >
            <p className="font-semibold text-accent-cyan">{term}</p>
            <p className="mt-1 text-text-muted">{definition}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
