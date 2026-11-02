/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Code, BookOpen, Calculator, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'interfaces' | 'fileservice' | 'math' | 'prd'>('interfaces');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Especificação Técnica & Arquitetura MFIC</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Interfaces TypeScript, FileService (90MB) e Matemática do Square Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          {[
            { id: 'interfaces', label: '1. Interfaces TypeScript', icon: Code },
            { id: 'fileservice', label: '2. FileService (90MB)', icon: Layers },
            { id: 'math', label: '3. Matemática do Letterbox', icon: Calculator },
            { id: 'prd', label: '4. Resumo PRD', icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === id
                  ? 'border-sky-500 text-sky-600 dark:text-sky-300 font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeTab === 'interfaces' && (
            <div className="space-y-3">
              <p className="font-sans text-slate-700 dark:text-slate-300 text-sm">
                Estrutura de interfaces TypeScript concebida para o pipeline modular de conversão baseado no Strategy Pattern:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 text-sky-300 dark:bg-slate-950 dark:text-sky-300 border border-slate-800 text-[11px] overflow-x-auto">
{`export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'ico' | 'svg';
export type FitMode = 'square' | 'contain' | 'cover' | 'stretch';

export interface ConversionConfig {
  formats: ImageFormat[];
  dimensions: Array<{ width: number; height: number; label?: string }>;
  fitMode: FitMode;
  backgroundColor: string; // 'transparent' ou '#ffffff'
  jpegQuality: number; // 0.1 a 1.0
  preserveVectorSvg: boolean;
}

export interface IConversionStrategy {
  readonly supportedFormats: ImageFormat[];
  convert(input: ConversionInput): Promise<Blob>;
}

export interface LetterboxGeometry {
  targetWidth: number;
  targetHeight: number;
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  mode: FitMode;
}`}
              </pre>
            </div>
          )}

          {activeTab === 'fileservice' && (
            <div className="space-y-3">
              <p className="font-sans text-slate-700 dark:text-slate-300 text-sm">
                Validação estrita de 90 MB por lote e verificação de extensões suportadas:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 dark:bg-slate-950 dark:text-emerald-300 border border-slate-800 text-[11px] overflow-x-auto">
{`export const MAX_BATCH_SIZE_BYTES = 90 * 1024 * 1024; // 90 MB

export class FileService {
  public static validateBatch(files: File[]): BatchValidationResult {
    let totalSize = 0;
    const errors: string[] = [];

    for (const file of files) {
      totalSize += file.size;
      const ext = this.getExtension(file.name);
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        errors.push(\`Formato não suportado (.\${ext})\`);
      }
    }

    if (totalSize > MAX_BATCH_SIZE_BYTES) {
      errors.unshift(\`Limite de lote excedido! Total: \${this.formatBytes(totalSize)} (Máx: 90MB)\`);
    }

    return {
      isValid: errors.length === 0,
      totalSize,
      maxAllowedSize: MAX_BATCH_SIZE_BYTES,
      remainingSize: Math.max(0, MAX_BATCH_SIZE_BYTES - totalSize),
      percentageUsed: Math.min(100, (totalSize / MAX_BATCH_SIZE_BYTES) * 100),
      errors,
    };
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'math' && (
            <div className="space-y-3 font-sans">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Lógica Matemática para Redimensionamento 'Square' (Letterboxing)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                Para redimensionar qualquer imagem de dimensões originais (W<sub>src</sub>, H<sub>src</sub>)
                para uma tela alvo (W<sub>target</sub>, H<sub>target</sub>) sem distorcer e mantendo proporção exata:
              </p>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 dark:bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <p className="text-sky-300 font-semibold">// 1. Fator de escala uniforme (mantém proporção sem cortar):</p>
                <p className="text-slate-200">const scale = Math.min(W_target / W_src, H_target / H_src);</p>

                <p className="text-sky-300 font-semibold mt-3">// 2. Dimensões calculadas do desenho:</p>
                <p className="text-slate-200">const drawWidth = Math.round(W_src * scale);</p>
                <p className="text-slate-200">const drawHeight = Math.round(H_src * scale);</p>

                <p className="text-sky-300 font-semibold mt-3">// 3. Offsets para centralizar no Canvas (Letterbox padding):</p>
                <p className="text-slate-200">const offsetX = Math.round((W_target - drawWidth) / 2);</p>
                <p className="text-slate-200">const offsetY = Math.round((H_target - drawHeight) / 2);</p>

                <p className="text-sky-300 font-semibold mt-3">// 4. Renderização no Canvas 2D:</p>
                <p className="text-slate-200">ctx.clearRect(0, 0, W_target, H_target);</p>
                <p className="text-slate-200">ctx.fillStyle = backgroundColor; // transparente ou sólido</p>
                <p className="text-slate-200">ctx.fillRect(0, 0, W_target, H_target);</p>
                <p className="text-slate-200">ctx.drawImage(sourceImage, offsetX, offsetY, drawWidth, drawHeight);</p>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                <p className="font-semibold">Exemplo Prático:</p>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  Imagem original de 800×400px adaptada para 150×150px:
                  <br />• scale = min(150/800, 150/400) = min(0.1875, 0.375) = 0.1875
                  <br />• drawWidth = 800 × 0.1875 = 150px
                  <br />• drawHeight = 400 × 0.1875 = 75px
                  <br />• offsetX = (150 - 150) / 2 = 0px
                  <br />• offsetY = (150 - 75) / 2 = 38px (barras superior e inferior simétricas)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'prd' && (
            <div className="space-y-3 font-sans text-xs">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Especificações do PRD Atendidas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">11 Dimensões Simultâneas:</span>
                  <p className="mt-1 font-mono text-[11px]">32x32, 128x128, 30x30, 44x44, 71x71, 89x89, 107x107, 142x142, 150x150, 284x284, 310x310</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">Matriz de Formatos:</span>
                  <p className="mt-1">PNG, SVG (Wrapper), JPEG, JPG, ICO, WEBP</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">Square Mode:</span>
                  <p className="mt-1">Letterboxing com preenchimento transparente ou cor sólida customizável</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">Privacidade & Memória:</span>
                  <p className="mt-1">Processamento 100% no navegador, fila streaming sequencial, revogação automática de Blob URLs</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
