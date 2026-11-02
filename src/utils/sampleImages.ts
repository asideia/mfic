/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates an in-memory sample PNG file for immediate zero-friction testing
 */
export async function createSampleImageFile(name: string = 'sample_logo.png', width: number = 800, height: number = 600): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw clean modern gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#334155');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Draw vibrant geometric emblem
  ctx.save();
  ctx.translate(width / 2, height / 2);

  // Outer ring
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 160, 0, Math.PI * 2);
  ctx.stroke();

  // Diamond inner
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.moveTo(0, -110);
  ctx.lineTo(110, 0);
  ctx.lineTo(0, 110);
  ctx.lineTo(-110, 0);
  ctx.closePath();
  ctx.fill();

  // Central icon core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Text label
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MFIC ENGINE', width / 2, height - 70);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob!], name, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}
