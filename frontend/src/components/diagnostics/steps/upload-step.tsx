"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Brain } from "lucide-react";
import Image from "next/image";
import { useDiagnostic } from "@/context/diagnostic-context";
import { formatFileSize } from "@/lib/utils";

export function UploadStep({ onNext }: { onNext: () => void }) {
  const {
    patientId,
    setPatientId,
    scanDate,
    setScanDate,
    previewUrl,
    fileMeta,
    setUploadedFile,
  } = useDiagnostic();
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const valid = /\.(jpg|jpeg|png|dcm|nii)$/i.test(file.name);
      if (!valid) return;
      console.debug("[brain-tumor] upload-step accepted file", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        setUploadedFile(file, url, {
          name: file.name,
          size: formatFileSize(file.size),
          dimensions: `${img.width} × ${img.height}px`,
        });
      };
      img.onerror = () => {
        setUploadedFile(file, url, {
          name: file.name,
          size: formatFileSize(file.size),
          dimensions: "N/A (DICOM/NIfTI)",
        });
      };
      img.src = url;
    },
    [setUploadedFile]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
          dragging ? "border-accent-cyan bg-accent-cyan/5" : "border-border"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute inset-[-2px] rounded-2xl opacity-50"
            style={{
              background: "conic-gradient(from 0deg, #4CC9F0, #7B61FF, #00D4FF, #4CC9F0)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] rounded-2xl bg-bg-card" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Brain className="h-16 w-16 text-accent-blue" />
          </motion.div>
          <p className="mt-4 font-display text-lg font-bold">Drop MRI scan here</p>
          <p className="mt-1 text-sm text-text-muted">.jpg .png .dcm .nii — max 10MB</p>
          <label className="btn-primary mt-6 cursor-pointer">
            <Upload className="h-4 w-4" />
            Select File
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.dcm,.nii"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </div>
      </motion.div>

      <div className="space-y-4">
        {previewUrl && (
          <div className="glass-card overflow-hidden p-4">
            <div className="relative mx-auto aspect-square max-h-48 w-full max-w-[200px]">
              <Image src={previewUrl} alt="MRI preview" fill className="rounded-lg object-cover" />
            </div>
            {fileMeta && (
              <dl className="mt-4 space-y-1 font-mono text-xs text-text-muted">
                <div className="flex justify-between"><dt>Name</dt><dd>{fileMeta.name}</dd></div>
                <div className="flex justify-between"><dt>Size</dt><dd>{fileMeta.size}</dd></div>
                <div className="flex justify-between"><dt>Dimensions</dt><dd>{fileMeta.dimensions}</dd></div>
              </dl>
            )}
          </div>
        )}
        <div className="glass-card space-y-4 p-4">
          <div>
            <label className="text-sm text-text-muted">Patient ID</label>
            <input
              className="input-field mt-1"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Scan Date</label>
            <input
              type="date"
              className="input-field mt-1"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary w-full disabled:opacity-50"
            disabled={!previewUrl}
            onClick={onNext}
          >
            Begin Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
