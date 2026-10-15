"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}

export function CountUp({ value, decimals = 0, suffix = "", duration = 1.5 }: CountUpProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString()
  );
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(String(v)));
    return unsub;
  }, [value, spring, display]);

  return (
    <motion.span className="font-mono tabular-nums">
      {text}
      {suffix}
    </motion.span>
  );
}
