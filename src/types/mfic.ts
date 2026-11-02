/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'ico' | 'svg';

export type FitMode = 'square' | 'contain' | 'cover' | 'stretch';

export interface DimensionPreset {
  id: string;
  width: number;
  height: number;
  label: string;
  category: 'windows' | 'web' | 'mobile' | 'custom';
  selected: boolean;
}

export interface ConversionConfig {
  formats: ImageFormat[];
  dimensions: Array<{ width: number; height: number; label?: string }>;
  fitMode: FitMode;
  backgroundColor: string; // 'transparent' or hex like '#ffffff'
  jpegQuality: number; // 0.1 to 1.0
  preserveVectorSvg: boolean;
}

export interface FileValidationItem {
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  isValid: boolean;
  error?: string;
}

export interface BatchValidationResult {
  isValid: boolean;
  totalSize: number;
  maxAllowedSize: number; // 90 MB in bytes
  remainingSize: number;
  percentageUsed: number;
  files: FileValidationItem[];
  errors: string[];
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
}

export interface ConvertedItem {
  id: string;
  sourceName: string;
  fileName: string;
  format: ImageFormat;
  width: number;
  height: number;
  blob: Blob;
  objectUrl: string;
  sizeBytes: number;
  durationMs: number;
}

export interface ConversionTask {
  id: string;
  file: File;
  name: string;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  results: ConvertedItem[];
}
