"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/layout/page-transition";
import { StepIndicator } from "@/components/diagnostics/step-indicator";
import { UploadStep } from "@/components/diagnostics/steps/upload-step";
import {
  PreprocessStep,
  FeatureExtractionStep,
  FusionStep,
} from "@/components/diagnostics/steps/pipeline-steps";
import { ClassificationStep } from "@/components/diagnostics/steps/classification-step";
import { XAIStep, ReportStep } from "@/components/diagnostics/steps/xai-report-steps";
import { useDiagnostic } from "@/context/diagnostic-context";
import { explainImage } from "@/lib/api";
import { saveHistoryEntry } from "@/lib/history-store";
import { getSeverity } from "@/lib/utils";
import type { DisplayLabel } from "@/types";

export default function DiagnosticsPage() {
  const {
    currentStep,
    setCurrentStep,
    file,
    setPrediction,
    setHeatmap,
    patientId,
  } = useDiagnostic();
  const [, setAnalyzing] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    console.debug("[brain-tumor] diagnostics page launching analysis", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setAnalyzing(true);
    setCurrentStep(2);
    try {
      const result = await explainImage(file);
      setPrediction(result);
      setHeatmap(result.heatmap);
      const label = result.predicted_label ?? result.tumor_type ?? "Unknown";
      toast.success(
        `Analysis complete — ${label} (${(result.confidence * 100).toFixed(1)}%)`
      );
      saveHistoryEntry({
        id: crypto.randomUUID(),
        dateTime: new Date().toISOString(),
        patientId,
        tumorType: label as DisplayLabel,
        confidence: result.confidence,
        severity: getSeverity(label as DisplayLabel),
        heatmap: result.heatmap ?? undefined,
        probabilities: result.probabilities,
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(`Analysis failed — ${message}`);
    } finally {
      setAnalyzing(false);
    }
  }, [file, setPrediction, setHeatmap, setCurrentStep, patientId]);

  const goToClassify = useCallback(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">MRI Diagnostics</h1>
        <p className="text-text-muted">7-step clinical analysis pipeline</p>
      </header>

      <StepIndicator current={currentStep} />

      {currentStep === 1 && (
        <UploadStep onNext={() => runAnalysis()} />
      )}
      {currentStep === 2 && (
        <PreprocessStep onComplete={() => setCurrentStep(3)} />
      )}
      {currentStep === 3 && (
        <FeatureExtractionStep onComplete={() => setCurrentStep(4)} />
      )}
      {currentStep === 4 && (
        <FusionStep onComplete={goToClassify} />
      )}
      {currentStep === 5 && (
        <ClassificationStep onNext={() => setCurrentStep(6)} />
      )}
      {currentStep === 6 && (
        <XAIStep onNext={() => setCurrentStep(7)} />
      )}
      {currentStep === 7 && <ReportStep />}
    </PageTransition>
  );
}
