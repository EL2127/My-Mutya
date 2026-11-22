// src/utils/canvas.ts
// Pure canvas helpers for the photo booth (no React in here).

export const W = 480;
export const H = 360;
export const STICKER_SIZE = 0.14;

export type FilterName = 'normal' | 'rose' | 'bw' | 'warm';

export const FILTERS: Record<FilterName, string> = {
  normal: 'none',
  rose: 'sepia(.35) saturate(1.5) hue-rotate(-25deg) brightness(1.05)',
  bw: 'grayscale(1) contrast(1.15)',
  warm: 'sepia(.45) saturate(1.3) brightness(1.05)',
};

/** x and y are fractions 0..1 of the photo size. */
export interface Sticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export type DrawSource = HTMLVideoElement | HTMLImageElement;

function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser');
  return ctx;
}

/** Copy a video frame or image into a 4:3 canvas with the filter and crown baked in. */
export function grab(
  source: DrawSource,
  sw: number,
  sh: number,
  mirror: boolean,
  filter: FilterName,
  crown: boolean,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = get2d(c);
  // "cover" fit: scale so the source fills the whole canvas, then center it
  const r = Math.max(W / sw, H / sh);
  const dw = sw * r;
  const dh = sh * r;
  ctx.save();
  if (mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.filter = FILTERS[filter];
  ctx.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
  if (crown) {
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', W / 2, 84);
  }
  return c;
}

/** The photo plus its stickers drawn on top. */
export function composite(shot: HTMLCanvasElement, stickers: Sticker[]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = get2d(c);
  ctx.drawImage(shot, 0, 0);
  ctx.font = `${Math.round(W * STICKER_SIZE)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  stickers.forEach((s) => ctx.fillText(s.emoji, s.x * W, s.y * H));
  return c;
}

/** Stacks the finished photos into one vertical photo-strip image. */
export function buildStrip(frames: HTMLCanvasElement[], herName: string): HTMLCanvasElement {
  const side = 14;
  const top = 14;
  const bottom = 58;
  const gap = 22;
  const margin = 30;
  const cardW = W + side * 2;
  const cardH = H + top + bottom;
  const c = document.createElement('canvas');
  c.width = cardW + margin * 2;
  c.height = margin * 2 + frames.length * cardH + (frames.length - 1) * gap;
  const ctx = get2d(c);
  ctx.fillStyle = '#9c0d27';
  ctx.fillRect(0, 0, c.width, c.height);
  frames.forEach((frame, i) => {
    ctx.save();
    ctx.translate(c.width / 2, margin + i * (cardH + gap) + cardH / 2);
    ctx.rotate(((i % 2 ? 1.2 : -1.2) * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(frame, -cardW / 2 + side, -cardH / 2 + top);
    ctx.fillStyle = '#9c0d27';
    ctx.textAlign = 'center';
    ctx.font = '34px Caveat, "Segoe Script", cursive';
    ctx.fillText(`${herName} 👑`, 0, cardH / 2 - 18);
    ctx.restore();
  });
  return c;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), type);
  });
}

/** Loads a picked file into an <img>. The temporary object URL is always released. */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      resolve(im);
      URL.revokeObjectURL(url);
    };
    im.onerror = () => {
      reject(new Error('bad image'));
      URL.revokeObjectURL(url);
    };
    im.src = url;
  });
}
