/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { FileService } from '../services/FileService';
import { ConversionTask } from '../types/mfic';

interface FileListProps {
  tasks: ConversionTask[];
  onRemoveTask: (id: string) => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  tasks,
  onRemoveTask,
  onClearAll,
  isProcessing,
}) => {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Imagens Selecionadas ({tasks.length})
        </h3>
        <button
          onClick={onClearAll}
          disabled={isProcessing}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xs overflow-hidden">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 relative">
                {task.previewUrl ? (
                  <img
                    src={task.previewUrl}
                    alt={task.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate max-w-xs md:max-w-md">
                  {task.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    {task.originalWidth > 0
                      ? `${task.originalWidth} × ${task.originalHeight} px`
                      : 'Carregando...'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{FileService.formatBytes(task.file.size)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase text-sky-600 dark:text-sky-400 font-semibold">{FileService.getExtension(task.name)}</span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {task.status === 'completed' && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pronto ({task.results.length})</span>
                </span>
              )}
              {task.status === 'processing' && (
                <span className="text-[11px] text-sky-600 dark:text-sky-400 animate-pulse font-mono">
                  Processando...
                </span>
              )}
              {task.status === 'error' && (
                <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Erro</span>
                </span>
              )}

              <button
                onClick={() => onRemoveTask(task.id)}
                disabled={isProcessing}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Remover imagem"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
