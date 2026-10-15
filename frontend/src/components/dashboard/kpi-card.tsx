"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  decimals?: number;
  change: number;
  icon: React.ReactNode;
  sparkData: { v: number }[];
  delay?: number;
  accent?: "blue" | "rose" | "emerald" | "cyan";
}

const accentMap = {
  blue: "from-accent-blue/20 to-transparent text-accent-blue shadow-[0_0_20px_rgba(76,201,240,0.2)]",
  rose: "from-accent-rose/20 to-transparent text-accent-rose shadow-[0_0_20px_rgba(255,77,109,0.2)]",
  emerald: "from-accent-emerald/20 to-transparent text-accent-emerald shadow-[0_0_20px_rgba(0,245,160,0.2)]",
  cyan: "from-accent-cyan/20 to-transparent text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.2)]",
};

export function KpiCard({
  title,
  value,
  suffix = "",
  decimals = 0,
  change,
  icon,
  sparkData,
  delay = 0,
  accent = "blue",
}: KpiCardProps) {
  const positive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card group p-5 transition-shadow hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
            accentMap[accent]
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
            positive ? "bg-accent-emerald/15 text-accent-emerald" : "bg-accent-rose/15 text-accent-rose"
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="mt-4 text-sm text-text-muted">{title}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </p>
      <div className="mt-3 h-12 opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4CC9F0" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4CC9F0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#4CC9F0"
              fill={`url(#spark-${title})`}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
