/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ShieldCheck, FileCode, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenDocs: () => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs, onLoadSample, isLoadingSample }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur sticky top-0 z-40 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              MFIC
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
              Multi-Format Image Converter
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>PRD & Arquitetura</span>
          </button>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>100% Client-Side (Zero Servidor)</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Limite 90MB por lote</span>
        </nav>

        {/* Zone 3: Actions & Theme Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={resolvedTheme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={onLoadSample}
            disabled={isLoadingSample}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 dark:bg-sky-400 dark:hover:bg-sky-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-sky-500/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingSample ? 'Gerando...' : 'Testar c/ Exemplo'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
