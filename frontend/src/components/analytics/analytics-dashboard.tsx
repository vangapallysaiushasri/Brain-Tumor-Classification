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
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import { CountUp } from "@/components/ui/count-up";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

const tooltipStyle = {
  backgroundColor: "#111D3A",
  border: "1px solid rgba(76,201,240,0.2)",
  borderRadius: "8px",
};

const confusionMatrix = [
  { actual: "Glioma", glioma: 98, meningioma: 1, pituitary: 0, noTumor: 1 },
  { actual: "Meningioma", glioma: 2, meningioma: 97, pituitary: 1, noTumor: 0 },
  { actual: "Pituitary", glioma: 0, meningioma: 2, pituitary: 96, noTumor: 2 },
  { actual: "No Tumor", glioma: 1, meningioma: 0, pituitary: 1, noTumor: 98 },
];

const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.05, tpr: 0.92 },
  { fpr: 0.1, tpr: 0.96 },
  { fpr: 0.2, tpr: 0.98 },
  { fpr: 1, tpr: 1 },
];

const prData = [
  { recall: 0, precision: 1 },
  { recall: 0.5, precision: 0.99 },
  { recall: 0.8, precision: 0.98 },
  { recall: 1, precision: 0.97 },
];

const lossData = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  train: 2.1 * Math.exp(-i * 0.2) + 0.05,
  val: 2.3 * Math.exp(-i * 0.18) + 0.08,
}));

const classAcc = [
  { class: "Glioma", acc: 98.2 },
  { class: "Meningioma", acc: 97.8 },
  { class: "Pituitary", acc: 97.5 },
  { class: "No Tumor", acc: 98.6 },
];

const gateLoss = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  loss: 0.15 * Math.exp(-i * 0.15) + 0.02,
}));

function ChartCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!ready) return <ChartSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-bold">{title}</h3>
        <button
          type="button"
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-blue/10 hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label={`Download ${title}`}
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
      {children}
    </motion.div>
  );
}

export function AnalyticsDashboard() {
  const metrics = [
    { label: "Accuracy", value: 98.4 },
    { label: "Precision", value: 97.9 },
    { label: "Recall", value: 98.1 },
    { label: "F1 Score", value: 98.0 },
  ];

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 text-center"
          >
            <p className="text-sm text-text-muted">{m.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-accent-cyan">
              <CountUp value={m.value} decimals={1} suffix="%" />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Confusion Matrix (4×4)" delay={0}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confusionMatrix} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis type="number" stroke="#6B7FA3" />
              <YAxis dataKey="actual" type="category" stroke="#6B7FA3" width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="glioma" stackId="a" fill="#FF4D6D" name="Glioma" />
              <Bar dataKey="meningioma" stackId="a" fill="#F97316" name="Meningioma" />
              <Bar dataKey="pituitary" stackId="a" fill="#EAB308" name="Pituitary" />
              <Bar dataKey="noTumor" stackId="a" fill="#00F5A0" name="No Tumor" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ROC Curve (One-vs-All)" delay={100}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis dataKey="fpr" stroke="#6B7FA3" label={{ value: "FPR", position: "insideBottom", offset: -5 }} />
              <YAxis stroke="#6B7FA3" label={{ value: "TPR", angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="tpr" stroke="#4CC9F0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Precision-Recall Curve" delay={200}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={prData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis dataKey="recall" stroke="#6B7FA3" />
              <YAxis stroke="#6B7FA3" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="precision" stroke="#7B61FF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Training vs Validation Loss" delay={300}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis dataKey="epoch" stroke="#6B7FA3" />
              <YAxis stroke="#6B7FA3" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="train" stroke="#4CC9F0" name="Train" dot={false} />
              <Line type="monotone" dataKey="val" stroke="#FF4D6D" name="Validation" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Class-wise Accuracy" delay={400}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={classAcc}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis dataKey="class" stroke="#6B7FA3" fontSize={11} />
              <YAxis domain={[95, 100]} stroke="#6B7FA3" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="acc" radius={[4, 4, 0, 0]}>
                {classAcc.map((_, i) => (
                  <Cell key={i} fill={["#FF4D6D", "#F97316", "#EAB308", "#00F5A0"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gate-Consistency Loss" delay={500}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={gateLoss}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,201,240,0.1)" />
              <XAxis dataKey="epoch" stroke="#6B7FA3" />
              <YAxis stroke="#6B7FA3" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="loss" stroke="#00D4FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
