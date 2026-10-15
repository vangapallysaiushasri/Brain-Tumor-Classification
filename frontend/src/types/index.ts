/** All 8 tumor types displayed in the Neuro-XAI UI */
export const ALL_TUMOR_TYPES = [
  "Glioma",
  "Meningioma",
  "Pituitary Adenoma",
  "Medulloblastoma",
  "Ependymoma",
  "Acoustic Neuroma (Schwannoma)",
  "Primary CNS Lymphoma",
  "Metastatic (Secondary) Tumor",
] as const;

export type TumorClass = (typeof ALL_TUMOR_TYPES)[number];

export type SpecialLabel =
  | "No Tumor Detected"
  | "Unclassified/Rare Tumor";

export type DisplayLabel = TumorClass | SpecialLabel;

export type Severity = "High" | "Medium" | "Low-Medium" | "Low";

export interface PredictionResult {
  filename?: string;
  predicted_class: number;
  predicted_label: DisplayLabel;
  tumor_type?: DisplayLabel;
  confidence: number;
  no_tumor_probability?: number;
  message?: string;
  original_prediction?: string;
  original_confidence?: number;
  probabilities: Record<TumorClass, number>;
  model_loaded?: boolean;
  lime?: string | null;
  lime_error?: string | null;
  shap?: string | null;
  shap_error?: string | null;
}

export interface ExplainResult extends PredictionResult {
  heatmap: string | null;
  heatmap_error?: string | null;
  lime?: string | null;
  lime_error?: string | null;
  shap?: string | null;
  shap_error?: string | null;
}

export interface ModelInfo {
  name: string;
  backbone: string;
  attention: string;
  parameters: string;
  version: string;
  accuracy: string;
  classes: TumorClass[];
  model_classes?: string[];
  dataset_size: number;
  model_loaded?: boolean;
}

export interface HealthStatus {
  status: string;
  model_loaded?: boolean;
  model_error?: string | null;
}

export interface ScanHistoryEntry {
  id: string;
  dateTime: string;
  patientId: string;
  tumorType: DisplayLabel;
  confidence: number;
  severity: Severity;
  imagePreview?: string;
  heatmap?: string;
  probabilities?: Record<TumorClass, number>;
}

export interface DashboardStats {
  totalScans: number;
  tumorsDetected: number;
  normalScans: number;
  avgConfidence: number;
  totalScansChange: number;
  tumorsChange: number;
  normalChange: number;
  confidenceChange: number;
}

export interface WeeklyScanData {
  day: string;
  scans: number;
  tumors: number;
}

export interface TumorDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ConfidenceTrend {
  date: string;
  confidence: number;
}

export interface DiagnosticSession {
  patientId: string;
  scanDate: string;
  file: File | null;
  previewUrl: string | null;
  fileMeta: { name: string; size: string; dimensions: string } | null;
  currentStep: number;
  prediction: PredictionResult | null;
  heatmap: string | null;
  preprocessingComplete: boolean;
}

export interface XAIMethod {
  id: "gradcam" | "shap" | "lime";
  label: string;
  description: string;
}
