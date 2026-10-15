"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PredictionResult } from "@/types";
import { generatePatientId } from "@/lib/utils";

interface DiagnosticContextValue {
  patientId: string;
  setPatientId: (id: string) => void;
  scanDate: string;
  setScanDate: (d: string) => void;
  file: File | null;
  previewUrl: string | null;
  fileMeta: { name: string; size: string; dimensions: string } | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  prediction: PredictionResult | null;
  setPrediction: (p: PredictionResult | null) => void;
  heatmap: string | null;
  setHeatmap: (h: string | null) => void;
  setUploadedFile: (file: File, preview: string, meta: { name: string; size: string; dimensions: string }) => void;
  resetSession: () => void;
}

const DiagnosticContext = createContext<DiagnosticContextValue | null>(null);

export function DiagnosticProvider({ children }: { children: ReactNode }) {
  const [patientId, setPatientId] = useState(generatePatientId());
  const [scanDate, setScanDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<DiagnosticContextValue["fileMeta"]>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [heatmap, setHeatmap] = useState<string | null>(null);

  const setUploadedFile = useCallback(
    (f: File, preview: string, meta: { name: string; size: string; dimensions: string }) => {
      setFile(f);
      setPreviewUrl(preview);
      setFileMeta(meta);
    },
    []
  );

  const resetSession = useCallback(() => {
    setPatientId(generatePatientId());
    setScanDate(new Date().toISOString().split("T")[0]);
    setFile(null);
    setPreviewUrl(null);
    setFileMeta(null);
    setCurrentStep(1);
    setPrediction(null);
    setHeatmap(null);
  }, []);

  const value = useMemo(
    () => ({
      patientId,
      setPatientId,
      scanDate,
      setScanDate,
      file,
      previewUrl,
      fileMeta,
      currentStep,
      setCurrentStep,
      prediction,
      setPrediction,
      heatmap,
      setHeatmap,
      setUploadedFile,
      resetSession,
    }),
    [
      patientId,
      scanDate,
      file,
      previewUrl,
      fileMeta,
      currentStep,
      prediction,
      heatmap,
      setUploadedFile,
      resetSession,
    ]
  );

  return (
    <DiagnosticContext.Provider value={value}>{children}</DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error("useDiagnostic must be used within DiagnosticProvider");
  return ctx;
}
