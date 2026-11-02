/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionConfig, ConvertedItem, ImageFormat } from '../types/mfic';
import { CanvasStrategy } from './strategies/CanvasStrategy';
import { IConversionStrategy } from './strategies/ConversionStrategy';
import { IcoStrategy } from './strategies/IcoStrategy';
import { SvgStrategy } from './strategies/SvgStrategy';

export interface EngineProgressCallback {
  (progress: {
    completedItems: number;
    totalItems: number;
    percentage: number;
    currentTaskName: string;
    currentSizeLabel: string;
  }): void;
}

export class CoreEngine {
  private strategies: Map<ImageFormat, IConversionStrategy> = new Map();

  constructor() {
    this.registerStrategy(new CanvasStrategy());
    this.registerStrategy(new IcoStrategy());
    this.registerStrategy(new SvgStrategy());
  }

  public registerStrategy(strategy: IConversionStrategy): void {
    for (const format of strategy.supportedFormats) {
      this.strategies.set(format, strategy);
    }
  }

  /**
   * Loads an image into an HTMLImageElement or ImageBitmap from a File
   */
  private async loadImageSource(file: File): Promise<{
    source: CanvasImageSource;
    width: number;
    height: number;
    cleanup: () => void;
  }> {
    // If createImageBitmap is available and not SVG, it's the fastest non-blocking path
    const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');
    if (!isSvg && typeof createImageBitmap !== 'undefined') {
      try {
        const bitmap = await createImageBitmap(file);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => bitmap.close(),
        };
      } catch {
        // Fallback to HTMLImageElement
      }
    }

    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        resolve({
          source: img,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          cleanup: () => URL.revokeObjectURL(objectUrl),
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Não foi possível carregar a imagem ${file.name}`));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Process a single source image against multiple dimensions and formats
   */
  public async processImage(
    file: File,
    config: ConversionConfig,
    onProgress?: (step: number, total: number, label: string) => void
  ): Promise<ConvertedItem[]> {
    const { source, width: sourceWidth, height: sourceHeight, cleanup } = await this.loadImageSource(file);

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const results: ConvertedItem[] = [];

    const totalOperations = config.dimensions.length * config.formats.length;
    let completed = 0;

    try {
      // Stream sequentially through dimensions and formats to avoid GPU/RAM exhaustion
      for (const dim of config.dimensions) {
        for (const format of config.formats) {
          const strategy = this.strategies.get(format);
          if (!strategy) {
            throw new Error(`Nenhuma estratégia registrada para o formato '${format}'`);
          }

          const opLabel = `${dim.width}x${dim.height} (${format.toUpperCase()})`;
          onProgress?.(completed, totalOperations, opLabel);

          const startTime = performance.now();

          const blob = await strategy.convert({
            imageSource: source,
            sourceWidth,
            sourceHeight,
            sourceFile: file,
            targetWidth: dim.width,
            targetHeight: dim.height,
            format,
            config,
          });

          const durationMs = Math.round(performance.now() - startTime);
          const objectUrl = URL.createObjectURL(blob);
          const ext = format === 'jpeg' ? 'jpg' : format;
          const fileName = `${baseName}_${dim.width}x${dim.height}.${ext}`;

          results.push({
            id: `${file.name}-${dim.width}x${dim.height}-${format}-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 6)}`,
            sourceName: file.name,
            fileName,
            format,
            width: dim.width,
            height: dim.height,
            blob,
            objectUrl,
            sizeBytes: blob.size,
            durationMs,
          });

          completed++;
          onProgress?.(completed, totalOperations, opLabel);
        }
      }
    } finally {
      // Memory cleanup
      cleanup();
    }

    return results;
  }

  /**
   * Process a batch of images sequentially (queue model)
   */
  public async processBatch(
    files: File[],
    config: ConversionConfig,
    onBatchProgress?: EngineProgressCallback
  ): Promise<Map<string, ConvertedItem[]>> {
    const batchMap = new Map<string, ConvertedItem[]>();
    const totalOperations = files.length * config.dimensions.length * config.formats.length;
    let totalCompleted = 0;

    for (const file of files) {
      const items = await this.processImage(file, config, (_fileStep, _fileTotal, opLabel) => {
        onBatchProgress?.({
          completedItems: totalCompleted,
          totalItems: totalOperations,
          percentage: totalOperations > 0 ? Math.round((totalCompleted / totalOperations) * 100) : 0,
          currentTaskName: file.name,
          currentSizeLabel: opLabel,
        });
      });

      totalCompleted += config.dimensions.length * config.formats.length;
      batchMap.set(file.name, items);

      onBatchProgress?.({
        completedItems: totalCompleted,
        totalItems: totalOperations,
        percentage: totalOperations > 0 ? Math.round((totalCompleted / totalOperations) * 100) : 100,
        currentTaskName: file.name,
        currentSizeLabel: 'Concluído',
      });
    }

    return batchMap;
  }
}
