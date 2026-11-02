/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { FileList } from './components/FileList';
import { ConfigPanel } from './components/ConfigPanel';
import { ConversionProgress } from './components/ConversionProgress';
import { ResultsGallery } from './components/ResultsGallery';
import { ArchitectureModal } from './components/ArchitectureModal';
import { DEFAULT_DIMENSION_PRESETS } from './constants/presets';
import { FileService } from './services/FileService';
import { CoreEngine } from './services/CoreEngine';
import { ExportService } from './services/ExportService';
import { createSampleImageFile } from './utils/sampleImages';
import {
  BatchValidationResult,
  ConversionConfig,
  ConversionTask,
  ConvertedItem,
  DimensionPreset,
} from './types/mfic';

export default function App() {
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [presets, setPresets] = useState<DimensionPreset[]>(DEFAULT_DIMENSION_PRESETS);
  const [config, setConfig] = useState<ConversionConfig>({
    formats: ['png', 'ico'],
    dimensions: [],
    fitMode: 'square',
    backgroundColor: 'transparent',
    jpegQuality: 0.92,
    preserveVectorSvg: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState<{
    completed: number;
    total: number;
    currentTaskName: string;
    currentSizeLabel: string;
  }>({
    completed: 0,
    total: 0,
    currentTaskName: '',
    currentSizeLabel: '',
  });

  const [convertedItems, setConvertedItems] = useState<ConvertedItem[]>([]);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Sync selected presets into config.dimensions
  useEffect(() => {
    const selectedDims = presets
      .filter((p) => p.selected)
      .map((p) => ({ width: p.width, height: p.height, label: p.label }));
    setConfig((prev) => ({ ...prev, dimensions: selectedDims }));
  }, [presets]);

  // Compute batch validation result
  const validationResult: BatchValidationResult | null = useMemo(() => {
    if (tasks.length === 0) return null;
    const files = tasks.map((t) => t.file);
    return FileService.validateBatch(files);
  }, [tasks]);

  // Add files to queue
  const handleFilesSelected = async (newFiles: File[]) => {
    const newTasks: ConversionTask[] = [];

    for (const file of newFiles) {
      const previewUrl = URL.createObjectURL(file);
      let width = 0;
      let height = 0;

      try {
        const dims = await FileService.getImageDimensions(file);
        width = dims.width;
        height = dims.height;
      } catch {
        // SVG or un-renderable fallback
      }

      newTasks.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        originalWidth: width,
        originalHeight: height,
        previewUrl,
        status: 'pending',
        progress: 0,
        results: [],
      });
    }

    setTasks((prev) => [...prev, ...newTasks]);
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const handleClearAll = () => {
    for (const t of tasks) {
      if (t.previewUrl) URL.revokeObjectURL(t.previewUrl);
    }
    setTasks([]);
  };

  const handleTogglePreset = (id: string) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleToggleAllPresets = (select: boolean) => {
    setPresets((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const handleAddCustomPreset = (width: number, height: number) => {
    const id = `custom-${width}x${height}-${Date.now()}`;
    setPresets((prev) => [
      ...prev,
      {
        id,
        width,
        height,
        label: `${width} × ${height}`,
        category: 'custom',
        selected: true,
      },
    ]);
  };

  const handleRemovePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      const sample = await createSampleImageFile('mfic_sample_emblem.png', 800, 600);
      await handleFilesSelected([sample]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Run conversion pipeline
  const handleStartConversion = async () => {
    if (tasks.length === 0 || config.dimensions.length === 0 || config.formats.length === 0) {
      return;
    }
    if (validationResult && !validationResult.isValid) {
      alert('Corrija os erros do lote de entrada antes de converter.');
      return;
    }

    setIsProcessing(true);
    const engine = new CoreEngine();
    const filesToProcess = tasks.map((t) => t.file);
    const totalOps = filesToProcess.length * config.dimensions.length * config.formats.length;

    setProgressState({
      completed: 0,
      total: totalOps,
      currentTaskName: 'Inicializando motor...',
      currentSizeLabel: '',
    });

    try {
      const allResults: ConvertedItem[] = [];

      await engine.processBatch(filesToProcess, config, (prog) => {
        setProgressState({
          completed: prog.completedItems,
          total: prog.totalItems,
          currentTaskName: prog.currentTaskName,
          currentSizeLabel: prog.currentSizeLabel,
        });
      });

      // Populate results per task
      for (const task of tasks) {
        const taskResults = await engine.processImage(task.file, config);
        allResults.push(...taskResults);
      }

      setConvertedItems((prev) => [...allResults, ...prev]);

      // Mark tasks completed
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'completed',
        }))
      );
    } catch (error) {
      console.error('Erro na conversão:', error);
      alert('Falha durante o processamento: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResults = () => {
    ExportService.cleanupUrls(convertedItems);
    setConvertedItems([]);
  };

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      for (const t of tasks) {
        if (t.previewUrl) URL.revokeObjectURL(t.previewUrl);
      }
      ExportService.cleanupUrls(convertedItems);
    };
  }, []);

  const totalPossibleOutputs =
    tasks.length * config.dimensions.length * config.formats.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-300">
      {/* Top Bar Header with Theme Switcher */}
      <Header
        onOpenDocs={() => setIsDocsOpen(true)}
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner / Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Conversor Multi-Formato & Redimensionador em Lote</span>
            <span aria-hidden="true">·</span>
            <span>Client-Side Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl">
            Converta e redimensione imagens simultaneamente com Square Mode e segurança de 90MB.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Processamento 100% no navegador via Canvas API nativa. Gere as 11 dimensões de grade (32×32 até 310×310) e múltiplos formatos (PNG, ICO, JPEG, WEBP, SVG) sem enviar dados para a nuvem.
          </p>
        </div>

        {/* Upload and File Manager */}
        <div className="space-y-4">
          <UploadZone
            onFilesSelected={handleFilesSelected}
            validationResult={validationResult}
            uploadedFilesCount={tasks.length}
          />

          <FileList
            tasks={tasks}
            onRemoveTask={handleRemoveTask}
            onClearAll={handleClearAll}
            isProcessing={isProcessing}
          />
        </div>

        {/* Configuration Panel */}
        <ConfigPanel
          presets={presets}
          config={config}
          onTogglePreset={handleTogglePreset}
          onToggleAllPresets={handleToggleAllPresets}
          onAddCustomPreset={handleAddCustomPreset}
          onRemovePreset={handleRemovePreset}
          onChangeConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
          isProcessing={isProcessing}
        />

        {/* Action Button Bar */}
        <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-30 backdrop-blur-md shadow-xl transition-colors">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Planejamento de Saída:</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 tabular-nums font-bold">
                {totalPossibleOutputs} arquivos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {tasks.length} {tasks.length === 1 ? 'imagem' : 'imagens'} × {config.dimensions.length} dimensões × {config.formats.length} formatos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartConversion}
              disabled={
                isProcessing ||
                tasks.length === 0 ||
                config.dimensions.length === 0 ||
                config.formats.length === 0 ||
                (validationResult !== null && !validationResult.isValid)
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isProcessing ? 'Convertendo...' : 'Iniciar Conversões'}</span>
            </button>
          </div>
        </div>

        {/* Progress Display */}
        {isProcessing && (
          <ConversionProgress
            completed={progressState.completed}
            total={progressState.total}
            currentTaskName={progressState.currentTaskName}
            currentSizeLabel={progressState.currentSizeLabel}
          />
        )}

        {/* Results Gallery */}
        <ResultsGallery
          items={convertedItems}
          onClearResults={handleClearResults}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/80 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">MFIC</span>
            <span>·</span>
            <span>Multi-Format Image Converter</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400">100% In-Browser Privacy</span>
          </div>
          <div>
            <span>Conforme Especificação Técnica PRD</span>
          </div>
        </div>
      </footer>

      {/* Architecture and Code Reference Modal */}
      <ArchitectureModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
