import type { DisplayLabel } from "@/types";
import { jsPDF } from "jspdf";

export interface ReportData {
  patientId: string;
  scanDate: string;
  label: DisplayLabel;
  confidence: number;
  previewUrl?: string;
  heatmap?: string | null;
  shap?: string | null;
  lime?: string | null;
}

async function toDataUrl(source?: string | null): Promise<string | null> {
  if (!source) return null;
  if (source.startsWith("data:")) return source;
  if (source.startsWith("blob:") || source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  if (source.length > 100) {
    return `data:image/png;base64,${source}`;
  }
  return null;
}

export async function generateReportPdf(data: ReportData) {
  console.log("Generating PDF report:", data);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const confidencePct = (data.confidence <= 1 ? data.confidence * 100 : data.confidence).toFixed(1);

  doc.setFillColor(18, 28, 58);
  doc.rect(0, 0, pageWidth, 297, "F");

  doc.setTextColor(88, 184, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NEURO-XAI DIAGNOSTIC REPORT", pageWidth / 2, 20, { align: "center" });

  doc.setTextColor(210, 226, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Precision Diagnostics. Explainable Intelligence.", pageWidth / 2, 27, { align: "center" });

  doc.setDrawColor(88, 184, 255);
  doc.line(margin, 34, pageWidth - margin, 34);

  doc.setTextColor(230, 238, 255);
  doc.setFontSize(11);
  doc.text(`Patient ID: ${data.patientId}`, margin, 44);
  doc.text(`Scan Date: ${data.scanDate}`, margin, 51);
  doc.text(`Classification: ${data.label}`, margin, 58);
  doc.text(`Confidence: ${confidencePct}%`, margin, 65);

  let y = 76;
  const previewDataUrl = await toDataUrl(data.previewUrl);
  const heatmapDataUrl = await toDataUrl(data.heatmap);
  const shapDataUrl = await toDataUrl(data.shap);
  const limeDataUrl = await toDataUrl(data.lime);

  if (previewDataUrl) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(210, 226, 255);
    doc.text("Original MRI", margin, y);
    doc.addImage(previewDataUrl, "PNG", margin, y + 4, 72, 72);
  }

  if (heatmapDataUrl) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(210, 226, 255);
    doc.text("Explainability Heatmap", margin + 84, y);
    doc.addImage(heatmapDataUrl, "PNG", margin + 84, y + 4, 72, 72);
  }

  if (shapDataUrl) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(210, 226, 255);
    doc.text("SHAP Attribution Map", margin, y + 80);
    doc.addImage(shapDataUrl, "PNG", margin, y + 84, 72, 72);
  }

  if (limeDataUrl) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(210, 226, 255);
    doc.text("LIME Explanation", margin + 84, y + 80);
    doc.addImage(limeDataUrl, "PNG", margin + 84, y + 84, 72, 72);
  }

  y += 162;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(88, 184, 255);
  doc.text("Model Notes", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(230, 238, 255);
  const noteLines = doc.splitTextToSize(
    `Cross-Gated Attention Fusion detected high-density feature activation consistent with ${data.label} morphology.`,
    contentWidth
  );
  doc.text(noteLines, margin, y + 7);

  doc.setFontSize(9);
  doc.setTextColor(160, 180, 220);
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin, 285);

  doc.save(`neuro-xai-report-${data.patientId}.pdf`);
}
