/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionInput, IConversionStrategy } from './ConversionStrategy';
import { ImageFormat } from '../../types/mfic';
import { CanvasStrategy } from './CanvasStrategy';

export class IcoStrategy implements IConversionStrategy {
  public readonly supportedFormats: ImageFormat[] = ['ico'];
  private canvasStrategy = new CanvasStrategy();

  /**
   * Encodes a PNG buffer into a binary Windows ICO file format.
   * Format specifications:
   * ICONDIR: 6 bytes (Reserved 2B, Type 2B, Count 2B)
   * ICONDIRENTRY: 16 bytes per image (Width, Height, Colors, Reserved, Planes, BitCount, Size, Offset)
   * Image payload: standard PNG data
   */
  public async convert(input: ConversionInput): Promise<Blob> {
    const { targetWidth, targetHeight } = input;

    // 1. Generate PNG blob for target dimension with letterboxing
    const pngBlob = await this.canvasStrategy.convert({
      ...input,
      format: 'png',
    });

    const pngBuffer = await pngBlob.arrayBuffer();
    const pngBytes = new Uint8Array(pngBuffer);

    // Total ICO file size = 6 (Header) + 16 (Directory Entry) + PNG payload length
    const totalSize = 6 + 16 + pngBytes.length;
    const icoBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(icoBuffer);
    const uint8View = new Uint8Array(icoBuffer);

    // --- ICONDIR (6 bytes) ---
    view.setUint16(0, 0, true); // Reserved (must be 0)
    view.setUint16(2, 1, true); // Image Type: 1 = ICO (Icon)
    view.setUint16(4, 1, true); // Number of images in file: 1

    // --- ICONDIRENTRY (16 bytes) ---
    const icoWidth = targetWidth >= 256 ? 0 : targetWidth;
    const icoHeight = targetHeight >= 256 ? 0 : targetHeight;

    view.setUint8(6, icoWidth); // Image width (0 means 256px)
    view.setUint8(7, icoHeight); // Image height (0 means 256px)
    view.setUint8(8, 0); // Number of colors in palette (0 = no palette)
    view.setUint8(9, 0); // Reserved (must be 0)
    view.setUint16(10, 1, true); // Color Planes (1)
    view.setUint16(12, 32, true); // Bits per pixel (32 = 24-bit RGB + 8-bit Alpha)
    view.setUint32(14, pngBytes.length, true); // Size of image data in bytes
    view.setUint32(18, 22, true); // Offset of image data (6 + 16 = 22)

    // --- Image Payload (PNG data) ---
    uint8View.set(pngBytes, 22);

    return new Blob([icoBuffer], { type: 'image/x-icon' });
  }
}
