/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, HardDrive, CheckCircle2 } from 'lucide-react';
import { FileService } from '../services/FileService';
import { BatchValidationResult } from '../types/mfic';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  validationResult: BatchValidationResult | null;
  uploadedFilesCount: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  validationResult,
  uploadedFilesCount,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const totalBytes = validationResult ? validationResult.totalSize : 0;
  const maxBytes = FileService.MAX_BYTES;
  const percentage = Math.min(100, Math.round((totalBytes / maxBytes) * 100));
  const isOverLimit = totalBytes > maxBytes;

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/60 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 shadow-xs'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.svg,.ico,.webp,image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <UploadCloud className="w-6 h-6 text-sky-500 dark:text-sky-400" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Arraste suas imagens aqui ou <span className="text-sky-600 dark:text-sky-400 underline decoration-sky-400/50">clique para selecionar</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formatos aceitos: <strong className="text-slate-700 dark:text-slate-300 font-medium">PNG, SVG, JPEG, JPG, ICO, WEBP</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Processamento local no navegador</span>
            <span aria-hidden="true">·</span>
            <span>Máximo 90 MB por lote</span>
          </div>
        </div>
      </div>

      {/* Batch 90MB Validation Meter */}
      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <HardDrive className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">Consumo do Lote de Entrada:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold tabular-nums">
              {FileService.formatBytes(totalBytes)} / {FileService.formatBytes(maxBytes)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs tabular-nums font-semibold ${
                isOverLimit
                  ? 'text-rose-600 dark:text-rose-400'
                  : percentage > 75
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {percentage}%
            </span>
            {uploadedFilesCount > 0 && (
              <span className="text-slate-500">({uploadedFilesCount} {uploadedFilesCount === 1 ? 'arquivo' : 'arquivos'})</span>
            )}
          </div>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverLimit
                ? 'bg-rose-500'
                : percentage > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        {/* Error or validation banners */}
        {validationResult && !validationResult.isValid && (
          <div className="mt-2 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Atenção: Validação do Lote Falhou</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-rose-700/90 dark:text-rose-300/90 font-mono text-[11px]">
              {validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && validationResult.isValid && uploadedFilesCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Lote válido ({FileService.formatBytes(validationResult.remainingSize)} livres restantes)</span>
          </div>
        )}
      </div>
    </div>
  );
};
