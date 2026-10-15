"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { ChartSkeleton } from "@/components/ui/skeleton";
import {
  DEMO_WEEKLY_SCANS,
  DEMO_TUMOR_DIST,
  DEMO_CONFIDENCE_TREND,
} from "@/lib/utils";

function useInView() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);
  return ready;
}

const chartTooltipStyle = {
  backgroundColor: "#111D3A",
  border: "1px solid rgba(76,201,240,0.2)",
  borderRadius: "8px",
  color: "#E8F0FF",
};

export function WeeklyVolumeChart() {
  const ready = useInView();
  if (!ready) return <ChartSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-bold">Weekly Scan Volume</h3>
      <p className="mb-4 text-sm text-text-muted">MRI scans processed this week</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={DEMO_WEEKLY_SCANS}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
          <XAxis dataKey="day" stroke="#6B7FA3" fontSize={12} />
          <YAxis stroke="#6B7FA3" fontSize={12} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
          <Bar dataKey="scans" fill="#4CC9F0" radius={[4, 4, 0, 0]} name="Total Scans" />
          <Bar dataKey="tumors" fill="#FF4D6D" radius={[4, 4, 0, 0]} name="Tumors Detected" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function TumorDistributionChart() {
  const ready = useInView();
  if (!ready) return <ChartSkeleton height={240} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-bold">Tumor Type Distribution</h3>
      <p className="mb-2 text-sm text-text-muted">Classification breakdown</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={DEMO_TUMOR_DIST}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {DEMO_TUMOR_DIST.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function ConfidenceTrendChart() {
  const ready = useInView();
  if (!ready) return <ChartSkeleton height={200} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-6"
    >
      <h3 className="font-display font-bold">Model Confidence Trend</h3>
      <p className="mb-4 text-sm text-text-muted">7-day average confidence</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={DEMO_CONFIDENCE_TREND}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
          <XAxis dataKey="date" stroke="#6B7FA3" fontSize={11} />
          <YAxis domain={[94, 100]} stroke="#6B7FA3" fontSize={11} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={{ fill: "#4CC9F0", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
