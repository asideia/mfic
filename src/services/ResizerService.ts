/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FitMode, LetterboxGeometry } from '../types/mfic';

export class ResizerService {
  /**
   * Calculates the exact draw dimensions and center offsets for rendering an image
   * inside a target rectangle according to the selected FitMode (Square/Letterbox, Contain, Cover, Stretch).
   *
   * @param sourceWidth Width of the original image in pixels
   * @param sourceHeight Height of the original image in pixels
   * @param targetWidth Destination width in pixels
   * @param targetHeight Destination height in pixels
   * @param mode FitMode ('square' | 'contain' | 'cover' | 'stretch')
   */
  public static calculateGeometry(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    mode: FitMode = 'square'
  ): LetterboxGeometry {
    if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
      throw new Error(
        `Dimensões inválidas: source(${sourceWidth}x${sourceHeight}), target(${targetWidth}x${targetHeight})`
      );
    }

    if (mode === 'stretch') {
      return {
        targetWidth,
        targetHeight,
        drawWidth: targetWidth,
        drawHeight: targetHeight,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        mode,
      };
    }

    if (mode === 'cover') {
      // Scale up so the entire target area is filled, cropping excess edges
      const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
      const drawWidth = Math.round(sourceWidth * scale);
      const drawHeight = Math.round(sourceHeight * scale);
      const offsetX = Math.round((targetWidth - drawWidth) / 2);
      const offsetY = Math.round((targetHeight - drawHeight) / 2);

      return {
        targetWidth,
        targetHeight,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
        scale,
        mode,
      };
    }

    // Default 'square' (Letterbox) and 'contain':
    // Uniform aspect ratio scale: fit entirely inside the target bounding box
    // scale = min(W_target / W_source, H_target / H_source)
    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
    const drawWidth = Math.round(sourceWidth * scale);
    const drawHeight = Math.round(sourceHeight * scale);

    // Center the scaled image in the target canvas (Letterboxing)
    const offsetX = Math.round((targetWidth - drawWidth) / 2);
    const offsetY = Math.round((targetHeight - drawHeight) / 2);

    return {
      targetWidth,
      targetHeight,
      drawWidth,
      drawHeight,
      offsetX,
      offsetY,
      scale,
      mode,
    };
  }

  /**
   * Applies the calculated geometry onto a 2D canvas context.
   * Clears canvas, renders optional background (e.g. solid white/black or transparent),
   * and draws the image at the centered offset.
   */
  public static renderToCanvas(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    imageSource: CanvasImageSource,
    geometry: LetterboxGeometry,
    backgroundColor: string = 'transparent'
  ): void {
    const { targetWidth, targetHeight, drawWidth, drawHeight, offsetX, offsetY } = geometry;

    // 1. Clear existing canvas pixels
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // 2. Fill background if not transparent
    if (backgroundColor && backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // 3. Configure high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 4. Draw letterboxed image centered without distortion
    ctx.drawImage(imageSource, offsetX, offsetY, drawWidth, drawHeight);
  }
}
