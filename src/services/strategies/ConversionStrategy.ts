/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionConfig, ImageFormat } from '../../types/mfic';

export interface ConversionInput {
  imageSource: CanvasImageSource;
  sourceWidth: number;
  sourceHeight: number;
  sourceFile: File;
  targetWidth: number;
  targetHeight: number;
  format: ImageFormat;
  config: ConversionConfig;
}

export interface IConversionStrategy {
  readonly supportedFormats: ImageFormat[];
  convert(input: ConversionInput): Promise<Blob>;
}
