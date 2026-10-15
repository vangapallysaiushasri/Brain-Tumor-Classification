"use client";

import { useQuery } from "@tanstack/react-query";
import { Microscope, AlertTriangle, CheckCircle, Target } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  WeeklyVolumeChart,
  TumorDistributionChart,
  ConfidenceTrendChart,
} from "@/components/dashboard/dashboard-charts";
import { RecentScansTable } from "@/components/dashboard/recent-scans-table";
import { getGreeting } from "@/lib/utils";
import { checkHealth } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const spark = (base: number) =>
  Array.from({ length: 8 }, (_, i) => ({ v: base + Math.sin(i) * 5 }));

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    retry: false,
  });

  useEffect(() => {
    if (health?.status === "ok") {
      toast.success("Model loaded — Ready for diagnostics", { id: "model-ready" });
    }
  }, [health]);

  const stats = {
    totalScans: 1247,
    tumors: 487,
    normal: 760,
    avgConf: 98.4,
    changes: { total: 12.4, tumors: 8.2, normal: 5.1, conf: 1.2 },
  };

  const getGreetingRole = () => {
    if (!user) return "User";
    if (user.specialization === "Patient") return "Patient";
    if (user.specialization === "Research") return "Researcher";
    return "Doctor";
  };

  return (
    <PageTransition>
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-bg-card p-6 backdrop-blur-glass">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {getGreeting()}, {getGreetingRole()} 👋
        </h1>
        <p className="mt-1 text-text-muted">
          Here&apos;s your diagnostic overview for today
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total MRI Scans"
          value={stats.totalScans}
          change={stats.changes.total}
          icon={<Microscope className="h-5 w-5" />}
          sparkData={spark(40)}
          delay={0}
          accent="blue"
        />
        <KpiCard
          title="Tumors Detected"
          value={stats.tumors}
          change={stats.changes.tumors}
          icon={<AlertTriangle className="h-5 w-5" />}
          sparkData={spark(18)}
          delay={0.1}
          accent="rose"
        />
        <KpiCard
          title="Normal Scans"
          value={stats.normal}
          change={stats.changes.normal}
          icon={<CheckCircle className="h-5 w-5" />}
          sparkData={spark(30)}
          delay={0.2}
          accent="emerald"
        />
        <KpiCard
          title="Avg Model Confidence"
          value={stats.avgConf}
          suffix="%"
          decimals={1}
          change={stats.changes.conf}
          icon={<Target className="h-5 w-5" />}
          sparkData={spark(96)}
          delay={0.3}
          accent="cyan"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyVolumeChart />
        </div>
        <TumorDistributionChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentScansTable />
        </div>
        <ConfidenceTrendChart />
      </div>
    </PageTransition>
  );
}
