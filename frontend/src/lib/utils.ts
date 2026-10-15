import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function generatePatientId(): string {
  return `PT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TUMOR_COLORS: Record<string, string> = {
  "Glioma": "#ef4444",
  "Meningioma": "#f97316",
  "Pituitary Adenoma": "#eab308",
  "Medulloblastoma": "#8b5cf6",
  "Ependymoma": "#06b6d4",
  "Acoustic Neuroma (Schwannoma)": "#a855f7",
  "Primary CNS Lymphoma": "#ec4899",
  "Metastatic (Secondary) Tumor": "#f43f5e",
  "No Tumor": "#22c55e",
  "Unclassified/Rare Tumor": "#eab308",
};

export function getSeverity(label: string): string {
  const severityMap: Record<string, string> = {
    "Glioma": "High",
    "Meningioma": "Medium",
    "Pituitary Adenoma": "Low-Medium",
    "No Tumor": "None",
    "Unclassified/Rare Tumor": "Unknown",
  };
  return severityMap[label] || "Unknown";
}

export function getTumorBadgeClass(label: string): string {
  const colorMap: Record<string, string> = {
    "Glioma": "bg-red-500/20 text-red-400 border-red-500/30",
    "Meningioma": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Pituitary Adenoma": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "No Tumor": "bg-green-500/20 text-green-400 border-green-500/30",
    "Unclassified/Rare Tumor": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return colorMap[label] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function emptyProbabilities(): Record<string, number> {
  return {
    "Glioma": 0,
    "Meningioma": 0,
    "Pituitary Adenoma": 0,
    "Medulloblastoma": 0,
    "Ependymoma": 0,
    "Acoustic Neuroma (Schwannoma)": 0,
    "Primary CNS Lymphoma": 0,
    "Metastatic (Secondary) Tumor": 0,
  };
}

// Demo data for charts
export const DEMO_WEEKLY_SCANS = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  scans: Math.floor(Math.random() * 50) + 20,
}));

export const DEMO_TUMOR_DIST = [
  { name: "Glioma", value: 35, color: "#ef4444" },
  { name: "Meningioma", value: 28, color: "#f97316" },
  { name: "Pituitary", value: 22, color: "#eab308" },
  { name: "No Tumor", value: 15, color: "#22c55e" },
];

export const DEMO_CONFIDENCE_TREND = Array.from({ length: 10 }, (_, i) => ({
  scan: i + 1,
  confidence: 85 + Math.random() * 14,
}));
