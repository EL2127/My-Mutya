// src/hooks/useConfetti.ts
import { useCallback, useEffect, useRef, type RefObject } from 'react';

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  c: string;
}

interface Confetti {
  canvasRef: RefObject<HTMLCanvasElement>;
  burst: () => void;
}

const COLORS = ['#c8102e', '#f2c14e', '#f48fb1', '#ffffff'];

/** Full-screen confetti. Render <canvas id="confetti" ref={canvasRef} /> and call burst(). */
export function useConfetti(): Confetti {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback((): void => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const burst = useCallback((): void => {
    const cv = canvasRef.current;
    const cx = cv?.getContext('2d');
    if (!cv || !cx) return;
    stop();
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const bits: Bit[] = Array.from({ length: 120 }, () => ({
      x: cv.width / 2,
      y: cv.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 2,
      s: Math.random() * 7 + 3,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const frame = (): void => {
      cx.clearRect(0, 0, cv.width, cv.height);
      bits.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.35; // gravity
        cx.fillStyle = b.c;
        cx.fillRect(b.x, b.y, b.s, b.s);
      });
      if (bits.some((b) => b.y < cv.height)) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        cx.clearRect(0, 0, cv.width, cv.height);
        rafRef.current = null;
      }
    };
    frame();
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { canvasRef, burst };
}
