/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchValidationResult, FileValidationItem } from '../types/mfic';

export const MAX_BATCH_SIZE_BYTES = 90 * 1024 * 1024; // 90 Megabytes (94,371,840 bytes)
export const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'ico', 'webp'];
export const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/webp',
];

export class FileService {
  public static readonly MAX_BYTES = MAX_BATCH_SIZE_BYTES;

  /**
   * Format bytes to human readable string (e.g. 14.50 MB)
   */
  public static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${formatted} ${sizes[i]}`;
  }

  /**
   * Extracts extension from file name in lowercase without dot
   */
  public static getExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length <= 1) return '';
    return parts.pop()!.toLowerCase().trim();
  }

  /**
   * Checks if an individual file extension or MIME type is supported
   */
  public static isFormatSupported(file: File): boolean {
    const ext = this.getExtension(file.name);
    if (SUPPORTED_EXTENSIONS.includes(ext)) return true;
    if (SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
    return false;
  }

  /**
   * Validates a batch of files against:
   * 1. 90MB Total Batch Size Limit
   * 2. Format / extension validity
   * 3. Non-empty file size
   */
  public static validateBatch(files: File[]): BatchValidationResult {
    let totalSize = 0;
    const errors: string[] = [];
    const items: FileValidationItem[] = [];

    for (const file of files) {
      const ext = this.getExtension(file.name);
      totalSize += file.size;

      let isValid = true;
      let errorMsg: string | undefined;

      if (!this.isFormatSupported(file)) {
        isValid = false;
        errorMsg = `Formato não suportado (.${ext || 'desconhecido'}). Suportados: PNG, SVG, JPEG, ICO, WEBP`;
      } else if (file.size <= 0) {
        isValid = false;
        errorMsg = 'Arquivo vazio (0 bytes)';
      }

      items.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        isValid,
        error: errorMsg,
      });

      if (errorMsg) {
        errors.push(`${file.name}: ${errorMsg}`);
      }
    }

    if (totalSize > MAX_BATCH_SIZE_BYTES) {
      const excessBytes = totalSize - MAX_BATCH_SIZE_BYTES;
      errors.unshift(
        `Limite de lote excedido! Total: ${this.formatBytes(totalSize)} (Máximo permitido: 90 MB. Excedente: ${this.formatBytes(excessBytes)})`
      );
    }

    const percentageUsed = Math.min(100, Math.round((totalSize / MAX_BATCH_SIZE_BYTES) * 1000) / 10);
    const remainingSize = Math.max(0, MAX_BATCH_SIZE_BYTES - totalSize);

    return {
      isValid: errors.length === 0,
      totalSize,
      maxAllowedSize: MAX_BATCH_SIZE_BYTES,
      remainingSize,
      percentageUsed,
      files: items,
      errors,
    };
  }

  /**
   * Loads an image file into memory to read its natural width and height
   */
  public static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };
        URL.revokeObjectURL(objectUrl);
        resolve(dimensions);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Falha ao ler dimensões da imagem ${file.name}: ${err}`));
      };

      img.src = objectUrl;
    });
  }
}
