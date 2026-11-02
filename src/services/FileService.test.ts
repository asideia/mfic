/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FileService, MAX_BATCH_SIZE_BYTES } from './FileService';

test('FileService.formatBytes produces expected human-readable strings', () => {
  assert.equal(FileService.formatBytes(0), '0 B');
  assert.equal(FileService.formatBytes(1024), '1 KB');
  assert.equal(FileService.formatBytes(1024 * 1024), '1 MB');
  assert.equal(FileService.formatBytes(90 * 1024 * 1024), '90 MB');
});

test('FileService.getExtension parses lowercase extensions', () => {
  assert.equal(FileService.getExtension('avatar.PNG'), 'png');
  assert.equal(FileService.getExtension('logo.svg'), 'svg');
  assert.equal(FileService.getExtension('archive.tar.gz'), 'gz');
  assert.equal(FileService.getExtension('noext'), '');
});

test('FileService.validateBatch approves batch within 90MB limit', () => {
  const dummyFile1 = {
    name: 'test1.png',
    size: 20 * 1024 * 1024, // 20 MB
    type: 'image/png',
  } as unknown as File;

  const dummyFile2 = {
    name: 'test2.jpg',
    size: 30 * 1024 * 1024, // 30 MB
    type: 'image/jpeg',
  } as unknown as File;

  const result = FileService.validateBatch([dummyFile1, dummyFile2]);
  assert.equal(result.isValid, true);
  assert.equal(result.totalSize, 50 * 1024 * 1024);
  assert.equal(result.errors.length, 0);
  assert.equal(result.percentageUsed, 55.6);
});

test('FileService.validateBatch rejects batch exceeding 90MB limit', () => {
  const largeFile1 = {
    name: 'heavy1.png',
    size: 50 * 1024 * 1024,
    type: 'image/png',
  } as unknown as File;

  const largeFile2 = {
    name: 'heavy2.png',
    size: 45 * 1024 * 1024, // Total 95 MB > 90 MB
    type: 'image/png',
  } as unknown as File;

  const result = FileService.validateBatch([largeFile1, largeFile2]);
  assert.equal(result.isValid, false);
  assert.ok(result.errors[0].includes('Limite de lote excedido'));
  assert.ok(result.totalSize > MAX_BATCH_SIZE_BYTES);
});

test('FileService.validateBatch flags unsupported file extensions', () => {
  const invalidFile = {
    name: 'document.pdf',
    size: 1024 * 1024,
    type: 'application/pdf',
  } as unknown as File;

  const result = FileService.validateBatch([invalidFile]);
  assert.equal(result.isValid, false);
  assert.equal(result.files[0].isValid, false);
  assert.ok(result.errors[0].includes('Formato não suportado'));
});
