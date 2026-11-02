/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionInput, IConversionStrategy } from './ConversionStrategy';
import { ImageFormat } from '../../types/mfic';
import { ResizerService } from '../ResizerService';

export class CanvasStrategy implements IConversionStrategy {
  public readonly supportedFormats: ImageFormat[] = ['png', 'jpeg', 'webp'];

  public async convert(input: ConversionInput): Promise<Blob> {
    const { imageSource, sourceWidth, sourceHeight, targetWidth, targetHeight, format, config } = input;

    // Use OffscreenCanvas if available, fallback to HTMLCanvasElement
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(targetWidth, targetHeight);
      ctx = canvas.getContext('2d');
    } else {
      canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx = canvas.getContext('2d');
    }

    if (!ctx) {
      throw new Error('Falha ao instanciar contexto 2D do Canvas.');
    }

    // Determine background color:
    // If format is JPEG, it cannot support transparency; fallback to white if transparent
    let effectiveBg = config.backgroundColor;
    if (format === 'jpeg' && (effectiveBg === 'transparent' || !effectiveBg)) {
      effectiveBg = '#ffffff';
    }

    // Compute letterbox geometry and render
    const geometry = ResizerService.calculateGeometry(
      sourceWidth,
      sourceHeight,
      targetWidth,
      targetHeight,
      config.fitMode
    );

    ResizerService.renderToCanvas(ctx, imageSource, geometry, effectiveBg);

    // Determine MIME type
    const mimeMap: Record<'png' | 'jpeg' | 'webp', string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    const mimeType = mimeMap[format as 'png' | 'jpeg' | 'webp'] || 'image/png';
    const quality = format === 'jpeg' || format === 'webp' ? config.jpegQuality : undefined;

    if (canvas instanceof OffscreenCanvas) {
      return await canvas.convertToBlob({ type: mimeType, quality });
    } else {
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(`Falha ao exportar canvas para blob ${format}`));
            }
          },
          mimeType,
          quality
        );
      });
    }
  }
}
