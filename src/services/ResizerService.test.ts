/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ResizerService } from './ResizerService';

test('Square Mode: horizontal image (800x400) letterboxed into 150x150', () => {
  const geo = ResizerService.calculateGeometry(800, 400, 150, 150, 'square');
  // Scale factor = min(150/800, 150/400) = 150/800 = 0.1875
  // drawWidth = 800 * 0.1875 = 150
  // drawHeight = 400 * 0.1875 = 75
  // offsetX = (150 - 150) / 2 = 0
  // offsetY = (150 - 75) / 2 = 37.5 -> rounded 38 or 37
  assert.equal(geo.drawWidth, 150);
  assert.equal(geo.drawHeight, 75);
  assert.equal(geo.offsetX, 0);
  assert.equal(geo.offsetY, 38);
  assert.equal(geo.targetWidth, 150);
  assert.equal(geo.targetHeight, 150);
});

test('Square Mode: vertical image (400x800) letterboxed into 310x310', () => {
  const geo = ResizerService.calculateGeometry(400, 800, 310, 310, 'square');
  // Scale factor = min(310/400, 310/800) = 310/800 = 0.3875
  // drawHeight = 800 * 0.3875 = 310
  // drawWidth = 400 * 0.3875 = 155
  // offsetX = (310 - 155) / 2 = 77.5 -> rounded 78 or 77
  // offsetY = 0
  assert.equal(geo.drawHeight, 310);
  assert.equal(geo.drawWidth, 155);
  assert.equal(geo.offsetX, 78);
  assert.equal(geo.offsetY, 0);
});

test('Square Mode: 1:1 image into 32x32 fills canvas perfectly with 0 offsets', () => {
  const geo = ResizerService.calculateGeometry(500, 500, 32, 32, 'square');
  assert.equal(geo.drawWidth, 32);
  assert.equal(geo.drawHeight, 32);
  assert.equal(geo.offsetX, 0);
  assert.equal(geo.offsetY, 0);
});

test('Stretch Mode: stretches to exact target dimensions with zero offset', () => {
  const geo = ResizerService.calculateGeometry(800, 200, 44, 44, 'stretch');
  assert.equal(geo.drawWidth, 44);
  assert.equal(geo.drawHeight, 44);
  assert.equal(geo.offsetX, 0);
  assert.equal(geo.offsetY, 0);
});

test('Cover Mode: scales up to fill entire area (cropping excess)', () => {
  const geo = ResizerService.calculateGeometry(800, 400, 100, 100, 'cover');
  // Scale = max(100/800, 100/400) = 0.25
  // drawWidth = 800 * 0.25 = 200
  // drawHeight = 400 * 0.25 = 100
  // offsetX = (100 - 200) / 2 = -50
  // offsetY = 0
  assert.equal(geo.drawWidth, 200);
  assert.equal(geo.drawHeight, 100);
  assert.equal(geo.offsetX, -50);
  assert.equal(geo.offsetY, 0);
});

test('ResizerService throws on non-positive dimensions', () => {
  assert.throws(() => {
    ResizerService.calculateGeometry(0, 100, 50, 50);
  });
  assert.throws(() => {
    ResizerService.calculateGeometry(100, -10, 50, 50);
  });
});
