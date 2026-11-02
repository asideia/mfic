/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionInput, IConversionStrategy } from './ConversionStrategy';
import { ImageFormat } from '../../types/mfic';
import { ResizerService } from '../ResizerService';
import { CanvasStrategy } from './CanvasStrategy';

export class SvgStrategy implements IConversionStrategy {
  public readonly supportedFormats: ImageFormat[] = ['svg'];
  private canvasStrategy = new CanvasStrategy();

  public async convert(input: ConversionInput): Promise<Blob> {
    const { sourceFile, sourceWidth, sourceHeight, targetWidth, targetHeight, config } = input;
    const geometry = ResizerService.calculateGeometry(
      sourceWidth,
      sourceHeight,
      targetWidth,
      targetHeight,
      config.fitMode
    );

    const isInputSvg =
      sourceFile.type.includes('svg') || sourceFile.name.toLowerCase().endsWith('.svg');

    let backgroundRect = '';
    if (config.backgroundColor && config.backgroundColor !== 'transparent') {
      backgroundRect = `<rect width="${targetWidth}" height="${targetHeight}" fill="${config.backgroundColor}" />\n`;
    }

    if (isInputSvg) {
      // Direct vector scaling wrapper
      try {
        const svgContent = await sourceFile.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const rootSvg = doc.querySelector('svg');

        if (rootSvg) {
          // Extract inner elements
          const innerMarkup = rootSvg.innerHTML;
          // Determine original viewBox or fallback to source dims
          const origViewBox = rootSvg.getAttribute('viewBox') || `0 0 ${sourceWidth} ${sourceHeight}`;

          const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  ${backgroundRect}
  <svg x="${geometry.offsetX}" y="${geometry.offsetY}" width="${geometry.drawWidth}" height="${geometry.drawHeight}" viewBox="${origViewBox}" preserveAspectRatio="xMidYMid meet">
    ${innerMarkup}
  </svg>
</svg>`;

          return new Blob([wrappedSvg], { type: 'image/svg+xml;charset=utf-8' });
        }
      } catch {
        // Fallback to raster wrapper if SVG parsing fails
      }
    }

    // Raster to SVG wrapper: convert to PNG and embed as base64 in SVG
    const pngBlob = await this.canvasStrategy.convert({
      ...input,
      format: 'png',
      config: {
        ...config,
        // Background handled by SVG rect for cleaner transparency
        backgroundColor: 'transparent',
      },
    });

    const dataUrl = await this.blobToDataUrl(pngBlob);

    const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
  ${backgroundRect}
  <image href="${dataUrl}" x="${geometry.offsetX}" y="${geometry.offsetY}" width="${geometry.drawWidth}" height="${geometry.drawHeight}" preserveAspectRatio="none" />
</svg>`;

    return new Blob([wrappedSvg], { type: 'image/svg+xml;charset=utf-8' });
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
