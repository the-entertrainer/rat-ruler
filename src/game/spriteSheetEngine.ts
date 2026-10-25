/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sogni 2D Spritesheet Slicing, Border Flood-Fill Chroma-Key & Animation Engine
 * Processes Sogni-generated 2D side-profile Rattus norvegicus spritesheets into
 * transparent, floor-aligned, multi-frame 2D animation sequences for the
 * Fallout Shelter-style underground cutaway view.
 */

import { CasteRole, EthologicalPosture } from './simulationEngine';

export type SpriteAnimType = 'walk' | 'forager' | 'rear' | 'dig';

export interface ProcessedSpriteFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SpriteAnimationBank {
  ready: boolean;
  frames: Record<SpriteAnimType, ProcessedSpriteFrame[]>;
}

interface CellSliceSpec {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  flipSourceX: boolean;
}

const SHEET_SLICE_SPECS: Record<SpriteAnimType, CellSliceSpec[]> = {
  walk: [
    { sx: 8, sy: 20, sw: 280, sh: 215, flipSourceX: false },
    { sx: 14, sy: 256, sw: 525, sh: 238, flipSourceX: false },
    { sx: 515, sy: 18, sw: 485, sh: 218, flipSourceX: false },
    { sx: 492, sy: 256, sw: 495, sh: 238, flipSourceX: false },
  ],
  forager: [
    { sx: 35, sy: 25, sw: 245, sh: 245, flipSourceX: false },
    { sx: 250, sy: 265, sw: 205, sh: 240, flipSourceX: false },
    { sx: 460, sy: 258, sw: 230, sh: 245, flipSourceX: false },
    { sx: 735, sy: 25, sw: 255, sh: 245, flipSourceX: true },
  ],
  rear: [
    { sx: 20, sy: 45, sw: 455, sh: 435, flipSourceX: true },
    { sx: 500, sy: 95, sw: 290, sh: 380, flipSourceX: false },
  ],
  dig: [
    { sx: 215, sy: 45, sw: 250, sh: 195, flipSourceX: false },
    { sx: 55, sy: 250, sw: 265, sh: 235, flipSourceX: true },
    { sx: 465, sy: 255, sw: 230, sh: 230, flipSourceX: false },
    { sx: 720, sy: 255, sw: 245, sh: 230, flipSourceX: true },
  ],
};

function isBackgroundCandidate(r: number, g: number, b: number): boolean {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const saturation = maxC - minC;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  // Studio white backdrop or neutral floor shadow
  if (luminance >= 232 && saturation <= 32) return true;
  if (luminance >= 212 && saturation <= 18) return true;
  return false;
}

/**
 * Extracts a single frame cell from a Sogni spritesheet, removes the white background
 * via border-seeded flood-fill + white-fringe decontamination, and crops tightly to the
 * rat's non-transparent bounding box so its feet align with the floor.
 */
function extractAndCleanFrame(
  img: HTMLImageElement,
  spec: CellSliceSpec
): ProcessedSpriteFrame {
  const workCanvas = document.createElement('canvas');
  workCanvas.width = spec.sw;
  workCanvas.height = spec.sh;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { canvas: workCanvas, width: spec.sw, height: spec.sh, aspectRatio: spec.sw / spec.sh };
  }

  ctx.save();
  if (spec.flipSourceX) {
    ctx.translate(spec.sw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    img,
    spec.sx,
    spec.sy,
    spec.sw,
    spec.sh,
    0,
    0,
    spec.sw,
    spec.sh
  );
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, spec.sw, spec.sh);
  const data = imgData.data;
  const w = spec.sw;
  const h = spec.sh;
  const total = w * h;

  // Border-seeded BFS flood fill to mark exterior white background
  const visited = new Uint8Array(total);
  const isBg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (idx: number) => {
    if (visited[idx]) return;
    visited[idx] = 1;
    const p = idx * 4;
    if (isBackgroundCandidate(data[p], data[p + 1], data[p + 2])) {
      isBg[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    tryEnqueue(x);
    tryEnqueue((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    tryEnqueue(y * w);
    tryEnqueue(y * w + (w - 1));
  }

  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = (curr - cx) / w;

    if (cx > 0) tryEnqueue(curr - 1);
    if (cx < w - 1) tryEnqueue(curr + 1);
    if (cy > 0) tryEnqueue(curr - w);
    if (cy < h - 1) tryEnqueue(curr + w);
  }

  // Also clear isolated pure-white interior gaps (e.g. between legs and tail)
  for (let idx = 0; idx < total; idx++) {
    if (isBg[idx]) continue;
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    if (r > 242 && g > 242 && b > 240 && maxC - minC <= 14) {
      isBg[idx] = 1;
    }
  }

  // Erode 1px of light anti-aliased fringe directly touching background
  const fringeMask = new Uint8Array(total);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue;
      if (
        isBg[idx - 1] ||
        isBg[idx + 1] ||
        isBg[idx - w] ||
        isBg[idx + w]
      ) {
        const p = idx * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (lum > 188 && sat < 45) {
          fringeMask[idx] = 1;
        }
      }
    }
  }
  for (let idx = 0; idx < total; idx++) {
    if (fringeMask[idx]) isBg[idx] = 1;
  }

  // Apply alpha transparency, edge color decontamination, and feathering
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const p = idx * 4;
      if (isBg[idx]) {
        data[p + 3] = 0;
        continue;
      }

      // Check how many 8-neighbors are background for smooth edge anti-aliasing
      let bgNeighbors = 0;
      if (x > 0 && isBg[idx - 1]) bgNeighbors++;
      if (x < w - 1 && isBg[idx + 1]) bgNeighbors++;
      if (y > 0 && isBg[idx - w]) bgNeighbors++;
      if (y < h - 1 && isBg[idx + w]) bgNeighbors++;

      if (bgNeighbors > 0) {
        // Decontaminate white bleed by shifting edge RGB slightly toward warm brown pelage
        data[p] = Math.round(data[p] * 0.78);
        data[p + 1] = Math.round(data[p + 1] * 0.72);
        data[p + 2] = Math.round(data[p + 2] * 0.65);
        data[p + 3] = Math.max(40, Math.round(255 * (1 - bgNeighbors * 0.22)));
      }

      if (data[p + 3] > 28) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (maxX <= minX || maxY <= minY) {
    return {
      canvas: workCanvas,
      width: spec.sw,
      height: spec.sh,
      aspectRatio: spec.sw / spec.sh,
    };
  }

  // Pad 2px around tight bounds
  const cropX = Math.max(0, minX - 2);
  const cropY = Math.max(0, minY - 2);
  const cropW = Math.min(w - cropX, maxX - minX + 5);
  const cropH = Math.min(h - cropY, maxY - minY + 5);
  const aspect = cropW / Math.max(1, cropH);

  // Downsample to true 16-bit pixel art grid (height = 36 pixels) with binary alpha & dark pixel outline
  const pixH = 38;
  const pixW = Math.max(16, Math.round(pixH * aspect));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = pixW;
  smallCanvas.height = pixH;
  const sCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
  if (sCtx) {
    sCtx.imageSmoothingEnabled = true;
    sCtx.drawImage(
      workCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      1,
      1,
      pixW - 2,
      pixH - 2
    );
    const pData = sCtx.getImageData(0, 0, pixW, pixH);
    const pd = pData.data;
    const solid = new Uint8Array(pixW * pixH);

    // Quantize RGB to crisp 16-bit color steps and threshold alpha
    for (let i = 0; i < pixW * pixH; i++) {
      const p = i * 4;
      if (pd[p + 3] > 95) {
        solid[i] = 1;
        pd[p] = Math.round(pd[p] / 24) * 24;
        pd[p + 1] = Math.round(pd[p + 1] / 24) * 24;
        pd[p + 2] = Math.round(pd[p + 2] / 24) * 24;
        pd[p + 3] = 255;
      } else {
        pd[p + 3] = 0;
      }
    }

    // Add crisp 1-texel dark pixel-art outline around sprite silhouette
    for (let y = 1; y < pixH - 1; y++) {
      for (let x = 1; x < pixW - 1; x++) {
        const idx = y * pixW + x;
        if (solid[idx]) continue;
        if (
          solid[idx - 1] ||
          solid[idx + 1] ||
          solid[idx - pixW] ||
          solid[idx + pixW]
        ) {
          const p = idx * 4;
          pd[p] = 26;
          pd[p + 1] = 15;
          pd[p + 2] = 9;
          pd[p + 3] = 255;
        }
      }
    }
    sCtx.putImageData(pData, 0, 0);
  }

  return {
    canvas: smallCanvas,
    width: pixW,
    height: pixH,
    aspectRatio: aspect,
  };
}

/**
 * Converts a Sogni room/background image into a crisp, quantized 16-bit pixel art canvas
 * so every background and chamber interior shares uniform pixel texel grid size.
 */
export function pixelateImageToCanvas(
  img: HTMLImageElement,
  pixelW: number,
  pixelH: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = pixelW;
  canvas.height = pixelH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, pixelW, pixelH);

  const imgData = ctx.getImageData(0, 0, pixelW, pixelH);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    // Quantize to 16-bit retro palette steps (step = 20)
    d[i] = Math.min(255, Math.round(d[i] / 20) * 20);
    d[i + 1] = Math.min(255, Math.round(d[i + 1] / 20) * 20);
    d[i + 2] = Math.min(255, Math.round(d[i + 2] / 20) * 20);
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function loadSogniSpriteBank(sheetUrls: {
  walk: string;
  forager: string;
  rear: string;
  dig: string;
}): Promise<SpriteAnimationBank> {
  const [walkImg, foragerImg, rearImg, digImg] = await Promise.all([
    loadImage(sheetUrls.walk),
    loadImage(sheetUrls.forager),
    loadImage(sheetUrls.rear),
    loadImage(sheetUrls.dig),
  ]);

  return {
    ready: true,
    frames: {
      walk: SHEET_SLICE_SPECS.walk.map((s) => extractAndCleanFrame(walkImg, s)),
      forager: SHEET_SLICE_SPECS.forager.map((s) =>
        extractAndCleanFrame(foragerImg, s)
      ),
      rear: SHEET_SLICE_SPECS.rear.map((s) => extractAndCleanFrame(rearImg, s)),
      dig: SHEET_SLICE_SPECS.dig.map((s) => extractAndCleanFrame(digImg, s)),
    },
  };
}

export function selectSpriteAnimForAgent(
  caste: CasteRole,
  posture: EthologicalPosture,
  isMoving: boolean
): SpriteAnimType {
  if (isMoving) {
    return 'walk';
  }
  if (
    posture === 'Bipedal Rearing & Whisking' ||
    caste === 'Savant' ||
    caste === 'Ruler'
  ) {
    return 'rear';
  }
  if (posture === 'Incisor Soil Excavation' || caste === 'Engineer') {
    return 'dig';
  }
  if (
    posture === 'Olfactory Scent-Trail Tracking' ||
    posture === 'Allogrooming Nape & Pelage' ||
    caste === 'Forager' ||
    caste === 'Matriarch'
  ) {
    return 'forager';
  }
  return 'walk';
}
