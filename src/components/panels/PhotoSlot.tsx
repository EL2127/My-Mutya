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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, W, H);
    
    if (shot) {
      // Gagamit tayo ng async function para hintayin matapos i-draw yung image stickers
      let isMounted = true;
      const draw = async () => {
        const comp = await composite(shot, stickers);
        if (isMounted && ctx) {
          ctx.clearRect(0, 0, W, H); 
          ctx.drawImage(comp, 0, 0);
        }
      };
      void draw();
      
      return () => {
        isMounted = false; // Cleanup kung mag-unmount habang naglo-load
      };
    }
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