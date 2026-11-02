/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ConversionProgressProps {
  completed: number;
  total: number;
  currentTaskName: string;
  currentSizeLabel: string;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  completed,
  total,
  currentTaskName,
  currentSizeLabel,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-3 shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 dark:text-sky-400" />
          <span className="font-semibold">Convertendo em fila de execução (Streaming)...</span>
        </div>
        <div className="font-mono text-sky-800 dark:text-sky-300 tabular-nums font-semibold">
          {completed} / {total} arquivos gerados ({percentage}%)
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-sky-200/60 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
        <span className="truncate max-w-xs">{currentTaskName}</span>
        <span className="text-sky-700 dark:text-sky-300 font-medium">{currentSizeLabel}</span>
      </div>
    </div>
  );
};
