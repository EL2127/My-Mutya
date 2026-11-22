// src/components/panels/PhotoSlot.tsx
import { useEffect, useRef } from 'react';
import { H, W, composite, type Sticker } from '../../utils/canvas';

interface PhotoSlotProps {
  index: number;
  shot: HTMLCanvasElement | null;
  stickers: Sticker[];
  selected: boolean;
  onClick: () => void;
}

/** One of the 3 small photo boxes. Redraws the photo with its stickers whenever either changes. */
export default function PhotoSlot({ index, shot, stickers, selected, onClick }: PhotoSlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (shot) ctx.drawImage(composite(shot, stickers), 0, 0);
  }, [shot, stickers]);

  return (
    <button
      type="button"
      className={`slot${shot ? ' filled' : ''}${selected ? ' selected' : ''}`}
      aria-label={`Photo ${index + 1}`}
      onClick={onClick}
    >
      <span hidden={!!shot}>{index + 1}</span>
      <canvas ref={canvasRef} width={W} height={H} hidden={!shot} />
    </button>
  );
}
