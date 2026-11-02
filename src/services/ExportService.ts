/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { ConvertedItem } from '../types/mfic';

export class ExportService {
  /**
   * Trigger direct single file download via invisible <a> click
   */
  public static downloadSingle(item: ConvertedItem): void {
    const link = document.createElement('a');
    link.href = item.objectUrl;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Package all converted items into a structured .ZIP file and trigger download
   */
  public static async downloadAllZip(
    items: ConvertedItem[],
    zipName: string = 'mfic-converted-images.zip',
    onProgress?: (percent: number, currentFile: string) => void
  ): Promise<void> {
    if (items.length === 0) {
      throw new Error('Nenhum arquivo para exportar.');
    }

    const zip = new JSZip();
    const manifest = {
      generator: 'MFIC - Multi-Format Image Converter',
      timestamp: new Date().toISOString(),
      totalFiles: items.length,
      files: [] as Array<{
        fileName: string;
        source: string;
        dimensions: string;
        format: string;
        sizeBytes: number;
      }>,
    };

    // Add each file to the zip archive
    for (const item of items) {
      zip.file(item.fileName, item.blob);
      manifest.files.push({
        fileName: item.fileName,
        source: item.sourceName,
        dimensions: `${item.width}x${item.height}`,
        format: item.format,
        sizeBytes: item.sizeBytes,
      });
    }

    // Add manifest summary
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate zip blob with DEFLATE compression
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        onProgress?.(Math.round(metadata.percent), metadata.currentFile || 'Comprimindo...');
      }
    );

    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke zip Object URL after short delay
    setTimeout(() => {
      URL.revokeObjectURL(zipUrl);
    }, 5000);
  }

  /**
   * Bulk revoke array of item Object URLs to free browser memory
   */
  public static cleanupUrls(items: ConvertedItem[]): void {
    for (const item of items) {
      if (item.objectUrl) {
        URL.revokeObjectURL(item.objectUrl);
      }
    }
  }
}
