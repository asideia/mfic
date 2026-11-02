/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Archive,
  Eye,
  X,
} from 'lucide-react';
import { ConvertedItem } from '../types/mfic';
import { FileService } from '../services/FileService';
import { ExportService } from '../services/ExportService';

interface ResultsGalleryProps {
  items: ConvertedItem[];
  onClearResults: () => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ items, onClearResults }) => {
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [previewItem, setPreviewItem] = useState<ConvertedItem | null>(null);

  if (items.length === 0) return null;

  const filteredItems =
    formatFilter === 'all' ? items : items.filter((it) => it.format === formatFilter);

  const totalSize = items.reduce((acc, it) => acc + it.sizeBytes, 0);

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(0);
      await ExportService.downloadAllZip(
        items,
        `mfic_export_${Date.now()}.zip`,
        (percent) => {
          setZipProgress(percent);
        }
      );
    } catch (err) {
      console.error(err);
      alert('Erro ao compactar ZIP: ' + err);
    } finally {
      setIsZipping(false);
    }
  };

  const uniqueFormats = Array.from(new Set(items.map((it) => it.format)));

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      {/* Header and Download Master Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Arquivos Convertidos ({items.length})
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
              Total: {FileService.formatBytes(totalSize)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Todos os arquivos gerados client-side, prontos para download individual ou pacote ZIP único
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onClearResults}
            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            Limpar Galeria
          </button>

          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-emerald-500/10 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>
              {isZipping ? `Compactando ZIP (${zipProgress}%)...` : `Baixar Tudo em .ZIP (${items.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {uniqueFormats.length > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Filtrar por formato:</span>
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setFormatFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                formatFilter === 'all'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-medium'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Todos ({items.length})
            </button>
            {uniqueFormats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-2.5 py-1 rounded text-xs uppercase transition-colors cursor-pointer ${
                  formatFilter === fmt
                    ? 'bg-slate-100 text-sky-600 dark:bg-slate-800 dark:text-sky-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {fmt} ({items.filter((it) => it.format === fmt).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Output Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/70 p-2.5 shadow-xs transition-all flex flex-col justify-between"
          >
            {/* Visual Canvas Container with checkerboard */}
            <div
              className="relative w-full aspect-square rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-hidden flex items-center justify-center p-2 mb-2"
              style={{
                backgroundColor: 'var(--canvas-check-bg, #f1f5f9)',
                backgroundImage:
                  'linear-gradient(45deg, rgba(148, 163, 184, 0.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.25) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.25) 75%)',
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
              }}
            >
              <img
                src={item.objectUrl}
                alt={item.fileName}
                className="max-w-full max-h-full object-contain filter drop-shadow-xs"
              />

              {/* Hover quick action overlay */}
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Inspecionar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => ExportService.downloadSingle(item)}
                  className="p-1.5 rounded-md bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors cursor-pointer"
                  title="Baixar arquivo"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item Meta */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                  {item.width}×{item.height}
                </span>
                <span className="uppercase text-sky-600 dark:text-sky-400 font-semibold">{item.format}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="truncate max-w-[70px]">{FileService.formatBytes(item.sizeBytes)}</span>
                <span className="text-slate-400 dark:text-slate-500">{item.durationMs}ms</span>
              </div>
            </div>

            <button
              onClick={() => ExportService.downloadSingle(item)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/50"
            >
              <Download className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>Baixar</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal Inspector */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{previewItem.fileName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {previewItem.width} × {previewItem.height} px · {previewItem.format.toUpperCase()} ·{' '}
                  {FileService.formatBytes(previewItem.sizeBytes)}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Preview */}
            <div
              className="w-full aspect-square max-h-80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-6"
              style={{
                backgroundColor: 'rgba(148, 163, 184, 0.15)',
                backgroundImage:
                  'linear-gradient(45deg, rgba(148, 163, 184, 0.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.25) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.25) 75%)',
                backgroundSize: '16px 16px',
              }}
            >
              <img
                src={previewItem.objectUrl}
                alt={previewItem.fileName}
                className="max-w-full max-h-full object-contain filter drop-shadow-md"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Origem: {previewItem.sourceName}</span>
              <button
                onClick={() => ExportService.downloadSingle(previewItem)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Imagem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
