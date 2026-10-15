"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { DEMO_HISTORY } from "@/lib/history-store";
import { formatDateTime, getTumorBadgeClass } from "@/lib/utils";

export function RecentScansTable() {
  const scans = DEMO_HISTORY.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-display font-bold">Recent Scans</h3>
          <p className="text-sm text-text-muted">Last 5 diagnostic sessions</p>
        </div>
        <Link href="/history" className="text-sm text-accent-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="px-6 py-3 font-medium">Patient ID</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Result</th>
              <th className="px-6 py-3 font-medium">Confidence</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="border-b border-border/50 transition-colors hover:bg-accent-blue/5"
              >
                <td className="px-6 py-3 font-mono text-xs">{scan.patientId}</td>
                <td className="px-6 py-3 text-text-muted">{formatDateTime(scan.dateTime)}</td>
                <td className="px-6 py-3">
                  <span className={getTumorBadgeClass(scan.tumorType)}>{scan.tumorType}</span>
                </td>
                <td className="px-6 py-3 font-mono text-accent-cyan">
                  {(scan.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-3">
                  <Link
                    href="/report"
                    className="inline-flex rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-blue/10 hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
