import type { DisplayLabel } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function normalizePercent(value: unknown): unknown {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  return value > 1 ? value / 100 : value;
}

function normalizePrediction(payload: PredictionResult): PredictionResult {
  return {
    ...payload,
    confidence: normalizePercent(payload.confidence) as number,
    no_tumor_probability: normalizePercent(payload.no_tumor_probability) as number,
    original_confidence: normalizePercent(payload.original_confidence) as number | undefined,
    probabilities: Object.fromEntries(
      Object.entries(payload.probabilities ?? {}).map(([key, value]) => [key, normalizePercent(value)])
    ) as Record<string, number>,
  };
}

function logUploadRequest(endpoint: string, file: File, formData: FormData) {
  console.debug(`[brain-tumor] POST ${API_BASE}${endpoint}`);
  console.debug("[brain-tumor] selected file", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  });
  console.debug("[brain-tumor] form-data keys", Array.from(formData.keys()));
}

export interface PredictionResult {
  predicted_class: number;
  predicted_label: DisplayLabel;
  tumor_type: DisplayLabel;
  confidence: number;
  no_tumor_probability: number;
  probabilities: Record<string, number>;
  model_classes: string[];
  all_tumor_types: string[];
  model_loaded: boolean;
  severity?: string;
  indicator_color?: string;
  message?: string;
  original_confidence?: number;
  unclassified?: boolean;
  heatmap: string | null;
  heatmap_error: string | null;
  lime?: string | null;
  lime_error?: string | null;
  shap?: string | null;
  shap_error?: string | null;
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "error", model_loaded: false };
  }
}

export async function explainImage(file: File): Promise<PredictionResult> {
  const analyze = async (endpoint: string) => {
    const formData = new FormData();
    formData.append("file", file);
    logUploadRequest(endpoint, file, formData);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let details = `HTTP ${response.status}`;
      const text = await response.text();
      if (text) {
        try {
          const payload = JSON.parse(text);
          if (payload?.error) {
            details = payload.error;
          } else {
            details = text;
          }
        } catch {
          details = text;
        }
      }
      throw new Error(details);
    }

    const payload = (await response.json()) as PredictionResult;
    console.debug(`[brain-tumor] response ${endpoint}`, payload);
    return normalizePrediction(payload);
  };

  try {
    return await analyze("/explain");
  } catch (error) {
    try {
      const fallback = await analyze("/predict");
      return { ...fallback, heatmap: null, heatmap_error: String(error) };
    } catch {
      throw error;
    }
  }
}
