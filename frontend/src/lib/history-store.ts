import type { DisplayLabel } from "@/types";

export interface HistoryEntry {
  id: string;
  dateTime: string;
  patientId: string;
  tumorType: DisplayLabel;
  confidence: number;
  severity: string;
  heatmap?: string;
  probabilities?: Record<string, number>;
}

const STORAGE_KEY = "neuro_xai_history";

export function saveHistoryEntry(entry: HistoryEntry) {
  const history = getHistory();
  history.unshift(entry);
  // Keep only last 50 entries
  if (history.length > 50) {
    history.pop();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return DEMO_HISTORY;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return DEMO_HISTORY;
}

export function deleteHistoryEntry(id: string) {
  const history = getHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Demo data
export const DEMO_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    dateTime: new Date(Date.now() - 3600000).toISOString(),
    patientId: "PT-ABC123-XYZ",
    tumorType: "Glioma",
    confidence: 0.94,
    severity: "High",
    probabilities: {
      "Glioma": 0.94,
      "Meningioma": 0.03,
      "Pituitary Adenoma": 0.02,
      "Medulloblastoma": 0.01,
      "Ependymoma": 0,
      "Acoustic Neuroma (Schwannoma)": 0,
      "Primary CNS Lymphoma": 0,
      "Metastatic (Secondary) Tumor": 0,
    },
  },
  {
    id: "2",
    dateTime: new Date(Date.now() - 7200000).toISOString(),
    patientId: "PT-DEF456-ABC",
    tumorType: "No Tumor Detected",
    confidence: 0.97,
    severity: "None",
    probabilities: {
      "Glioma": 0.01,
      "Meningioma": 0.01,
      "Pituitary Adenoma": 0.01,
      "Medulloblastoma": 0,
      "Ependymoma": 0,
      "Acoustic Neuroma (Schwannoma)": 0,
      "Primary CNS Lymphoma": 0,
      "Metastatic (Secondary) Tumor": 0,
    },
  },
  {
    id: "3",
    dateTime: new Date(Date.now() - 10800000).toISOString(),
    patientId: "PT-GHI789-DEF",
    tumorType: "Meningioma",
    confidence: 0.89,
    severity: "Medium",
    probabilities: {
      "Glioma": 0.05,
      "Meningioma": 0.89,
      "Pituitary Adenoma": 0.04,
      "Medulloblastoma": 0.01,
      "Ependymoma": 0.01,
      "Acoustic Neuroma (Schwannoma)": 0,
      "Primary CNS Lymphoma": 0,
      "Metastatic (Secondary) Tumor": 0,
    },
  },
];
