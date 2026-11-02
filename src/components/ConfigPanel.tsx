/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Maximize2,
  Sliders,
  Palette,
  FileType,
} from 'lucide-react';
import { ConversionConfig, DimensionPreset, FitMode, ImageFormat } from '../types/mfic';

interface ConfigPanelProps {
  presets: DimensionPreset[];
  config: ConversionConfig;
  onTogglePreset: (id: string) => void;
  onToggleAllPresets: (select: boolean) => void;
  onAddCustomPreset: (width: number, height: number) => void;
  onRemovePreset: (id: string) => void;
  onChangeConfig: (updates: Partial<ConversionConfig>) => void;
  isProcessing: boolean;
}

const AVAILABLE_FORMATS: Array<{ format: ImageFormat; label: string; desc: string }> = [
  { format: 'png', label: 'PNG', desc: 'Sem perdas, com transparência' },
  { format: 'jpeg', label: 'JPEG / JPG', desc: 'Fotografias e tamanhos compactos' },
  { format: 'webp', label: 'WEBP', desc: 'Alta compressão para Web' },
  { format: 'ico', label: 'ICO', desc: 'Ícone Windows e Favicon nativo' },
  { format: 'svg', label: 'SVG', desc: 'Wrapper vetorial com dimensões' },
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  presets,
  config,
  onTogglePreset,
  onToggleAllPresets,
  onAddCustomPreset,
  onChangeConfig,
  isProcessing,
}) => {
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const handleFormatToggle = (format: ImageFormat) => {
    const current = config.formats;
    if (current.includes(format)) {
      if (current.length === 1) return; // Keep at least one
      onChangeConfig({ formats: current.filter((f) => f !== format) });
    } else {
      onChangeConfig({ formats: [...current, format] });
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(customW, 10);
    const h = parseInt(customH, 10);
    if (w > 0 && h > 0 && w <= 4096 && h <= 4096) {
      onAddCustomPreset(w, h);
      setCustomW('');
      setCustomH('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Resize Matrix Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Grade de Redimensionamento (Output)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              11 dimensões simultâneas especificadas no PRD + dimensões customizadas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleAllPresets(true)}
              disabled={isProcessing}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors font-medium cursor-pointer"
            >
              Selecionar Todas ({presets.length})
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              onClick={() => onToggleAllPresets(false)}
              disabled={isProcessing}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Desmarcar
            </button>
          </div>
        </div>

        {/* Presets chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {presets.map((preset) => {
            const isSelected = preset.selected;
            return (
              <button
                key={preset.id}
                onClick={() => onTogglePreset(preset.id)}
                disabled={isProcessing}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 shadow-xs font-semibold'
                    : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  )}
                  <span className="tabular-nums">{preset.width}×{preset.height}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add custom dimension form */}
        <form onSubmit={handleAddCustom} className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400">Adicionar dimensão:</span>
          <input
            type="number"
            min="8"
            max="4096"
            placeholder="Largura"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            disabled={isProcessing}
            className="w-20 px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">×</span>
          <input
            type="number"
            min="8"
            max="4096"
            placeholder="Altura"
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            disabled={isProcessing}
            className="w-20 px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!customW || !customH || isProcessing}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* 2. Format Matrix & Square Mode Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Output Formats */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileType className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Formatos de Saída</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {config.formats.length} selecionado(s)
            </span>
          </div>

          <div className="space-y-1.5">
            {AVAILABLE_FORMATS.map(({ format, label, desc }) => {
              const active = config.formats.includes(format);
              return (
                <button
                  key={format}
                  onClick={() => handleFormatToggle(format)}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/20 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {active ? (
                      <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{label}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Square Mode & Letterbox Controls */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Square Mode (Letterboxing) & Fundo</span>
            </h4>
          </div>

          <div className="space-y-3">
            {/* Fit mode selector */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                Modo de Enquadramento:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { mode: 'square' as FitMode, label: 'Square (Letterbox)' },
                  { mode: 'contain' as FitMode, label: 'Contain' },
                  { mode: 'cover' as FitMode, label: 'Cover (Preencher)' },
                  { mode: 'stretch' as FitMode, label: 'Stretch (Esticar)' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => onChangeConfig({ fitMode: mode })}
                    disabled={isProcessing}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors text-center cursor-pointer ${
                      config.fitMode === mode
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background fill */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Preenchimento do Fundo (Letterbox):
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {config.backgroundColor}
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { color: 'transparent', label: 'Transparente' },
                  { color: '#ffffff', label: 'Branco' },
                  { color: '#000000', label: 'Preto' },
                ].map(({ color, label }) => (
                  <button
                    key={color}
                    onClick={() => onChangeConfig({ backgroundColor: color })}
                    disabled={isProcessing}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      config.backgroundColor === color
                        ? 'border-sky-500 bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700"
                      style={{
                        backgroundColor: color === 'transparent' ? 'rgba(148, 163, 184, 0.2)' : color,
                        backgroundImage:
                          color === 'transparent'
                            ? 'radial-gradient(#94a3b8 1px, transparent 1px)'
                            : 'none',
                        backgroundSize: '4px 4px',
                      }}
                    />
                    <span>{label}</span>
                  </button>
                ))}

                {/* Custom color input */}
                <div className="flex items-center gap-1.5 pl-1">
                  <input
                    type="color"
                    value={config.backgroundColor.startsWith('#') ? config.backgroundColor : '#ffffff'}
                    onChange={(e) => onChangeConfig({ backgroundColor: e.target.value })}
                    disabled={isProcessing}
                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                    title="Escolher cor personalizada"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Cor custom</span>
                </div>
              </div>
            </div>

            {/* Quality Slider for JPEG / WebP */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Qualidade JPEG / WEBP:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                  {Math.round(config.jpegQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={config.jpegQuality}
                onChange={(e) => onChangeConfig({ jpegQuality: parseFloat(e.target.value) })}
                disabled={isProcessing}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
