"use client";

import { useMemo, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { DEMO_HISTORY, getHistory, deleteHistoryEntry } from "@/lib/history-store";
import { formatDateTime, getTumorBadgeClass } from "@/lib/utils";
import { ALL_TUMOR_TYPES, type DisplayLabel } from "@/types";
import { Eye, Download, Trash2, Search } from "lucide-react";
import Link from "next/link";

const FILTER_TYPES: DisplayLabel[] = [
  ...ALL_TUMOR_TYPES,
  "Unclassified/Rare Tumor",
  "No Tumor Detected",
];

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [tumorFilter, setTumorFilter] = useState<DisplayLabel | "">("");
  const [confMin, setConfMin] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const entries = useMemo(() => {
    const stored = getHistory();
    const list = stored.length > 0 ? stored : DEMO_HISTORY;
    return list.filter((e) => {
      if (search && !e.patientId.toLowerCase().includes(search.toLowerCase())) return false;
      if (tumorFilter && e.tumorType !== tumorFilter) return false;
      if (e.confidence * 100 < confMin) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh forces re-read from localStorage
  }, [search, tumorFilter, confMin, refresh]);

  const totalPages = Math.ceil(entries.length / pageSize);
  const paged = entries.slice(page * pageSize, (page + 1) * pageSize);

  const exportCsv = () => {
    const header = "ID,Date,Patient,Tumor,Confidence,Severity\n";
    const rows = entries
      .map(
        (e) =>
          `${e.id},${e.dateTime},${e.patientId},${e.tumorType},${(e.confidence * 100).toFixed(1)},${e.severity}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neuro-xai-history.csv";
    a.click();
  };

  return (
    <PageTransition>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">History Logs</h1>
          <p className="text-text-muted">Searchable diagnostic session archive</p>
        </div>
        <button type="button" className="btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </header>

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            className="input-field pl-9"
            placeholder="Search Patient ID"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input-field"
          value={tumorFilter}
          onChange={(e) => { setTumorFilter(e.target.value as DisplayLabel | ""); setPage(0); }}
        >
          <option value="">All tumor types</option>
          {FILTER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div>
          <label className="text-xs text-text-muted">Min confidence: {confMin}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={confMin}
            onChange={(e) => { setConfMin(Number(e.target.value)); setPage(0); }}
            className="mt-1 w-full accent-accent-cyan"
          />
        </div>
        <select
          className="input-field"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-elevated text-left text-text-muted">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Tumor Type</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-accent-blue/5">
                  <td className="px-4 py-3 font-mono text-xs">{page * pageSize + i + 1}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDateTime(row.dateTime)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.patientId}</td>
                  <td className="px-4 py-3">
                    <span className={getTumorBadgeClass(row.tumorType)}>{row.tumorType}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-accent-cyan">
                    {(row.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">{row.severity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href="/report"
                        className="rounded p-1.5 text-text-muted hover:bg-accent-blue/10 hover:text-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button type="button" className="rounded p-1.5 text-text-muted hover:text-accent-blue focus-visible:ring-2 focus-visible:ring-accent-blue">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-text-muted hover:text-accent-rose focus-visible:ring-2 focus-visible:ring-accent-rose"
                        onClick={() => {
                          deleteHistoryEntry(row.id);
                          setRefresh((r) => r + 1);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
