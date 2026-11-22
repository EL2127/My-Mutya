// src/components/panels/BoothPanel.tsx
import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { usePhotoBooth } from '../../hooks/usePhotoBooth';
import { FILTERS, H, W, type FilterName, type Sticker } from '../../utils/canvas';
import Panel from './Panel';
import PhotoSlot from './PhotoSlot';
import { Download, Heart, Sparkles, Undo2 } from 'lucide-react';
import GoldCrown from '../GoldCrown';

interface BoothPanelProps {
  active: boolean;
  herName: string;
  onBurst: () => void;
  onShowVideo: () => void;
  /** Back arrow in the booth: return to the homepage. */
  onReset: () => void;
}

const FILTER_BUTTONS: { name: FilterName; label: string }[] = [
  { name: 'normal', label: 'Normal' },
  { name: 'rose', label: 'Rose' },
  { name: 'bw', label: 'B&W' },
  { name: 'warm', label: 'Warm' },
];

const STICKER_BUTTONS: { emoji: string; label: string }[] = [
  { emoji: '\u{1F451}', label: 'crown' },
  { emoji: '\u2728', label: 'sparkle' },
  { emoji: '\u{1F496}', label: 'heart' },
  { emoji: '\u{1F339}', label: 'rose' },
  { emoji: '\u{1F380}', label: 'ribbon' },
  { emoji: '\u{1F352}', label: 'cherry' },
  { emoji: '\u{1F98B}', label: 'butterfly' },
];

export default function BoothPanel({ active, herName, onBurst, onShowVideo, onReset }: BoothPanelProps) {
  const booth = usePhotoBooth({ herName, active, onBurst, onShowVideo });
  const { editing, curtain, live, shots, stickers } = booth;
  const editCanvasRef = useRef<HTMLCanvasElement>(null);

  // Show the photo being edited on the big canvas (stickers are a draggable layer on top)
  useEffect(() => {
    const ctx = editCanvasRef.current?.getContext('2d');
    if (!ctx || editing === null) return;
    const shot = shots[editing];
    ctx.clearRect(0, 0, W, H);
    if (shot) ctx.drawImage(shot, 0, 0);
  }, [editing, shots]);

  /** Drag a sticker with mouse or finger. Position is kept as a 0..1 fraction of the photo. */
  const dragSticker = (e: PointerEvent<HTMLSpanElement>, s: Sticker): void => {
    const box = booth.viewfinderRef.current?.getBoundingClientRect();
    if (!box) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev: globalThis.PointerEvent): void => {
      const x = Math.min(1, Math.max(0, (ev.clientX - box.left) / box.width));
      const y = Math.min(1, Math.max(0, (ev.clientY - box.top) / box.height));
      booth.moveSticker(s.id, x, y);
    };
    const stop = (): void => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', stop);
      el.removeEventListener('pointercancel', stop);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
  };

  const editingStickers = editing === null ? [] : stickers[editing];

  return (
    <Panel id="booth" active={active}>
      <div className="booth">
        {/* top row: back (left) and download (right) */}
        <div className="booth-top">
          <button type="button" className="chip" id="boothReset" onClick={onReset}>
            <Undo2 className="ico" size="1em" aria-hidden /> Back
          </button>
          <button
            type="button"
            className="chip"
            id="boothSave"
            disabled={!booth.any}
            onClick={() => void booth.saveStrip()}
          >
            <Download className="ico" size="1em" aria-hidden /> Save strip
          </button>
        </div>

        <div className="booth-grid">
          {/* big polaroid preview */}
          <div className="polaroid">
            <div className={`viewfinder${editing !== null ? ' editing' : ''}`} id="viewfinder" ref={booth.viewfinderRef}>
              <span id="vfHint" hidden={live}>
                Open the curtain, then tap the round button
              </span>
              <video
                id="video"
                ref={booth.videoRef}
                autoPlay
                muted
                playsInline
                hidden={!live}
                style={{ filter: FILTERS[booth.filterName] }}
              />
              <canvas id="editCanvas" ref={editCanvasRef} width={W} height={H} hidden={editing === null} />
              <div id="stickerLayer">
                {editingStickers.map((s) => (
                  <span
                    key={s.id}
                    className="sticker"
                    title="Drag to move, double-click to remove"
                    style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
                    onPointerDown={(e) => dragSticker(e, s)}
                    onDoubleClick={() => booth.removeSticker(s.id)}
                  >
                    {s.emoji}
                  </span>
                ))}
              </div>
              <div className="vf-count" id="vfCount" hidden={booth.count === null}>
                {booth.count}
              </div>
              {/* changing the key restarts the flash animation */}
              <div key={booth.flashKey} className={`vf-flash${booth.flashKey ? ' go' : ''}`} id="vfFlash" />
              <button
                type="button"
                className="shutter"
                id="shutter"
                aria-label="Take photos"
                disabled={booth.busy}
                onClick={() => void booth.shutter()}
              />

              {/* red curtain on top of everything */}
              <div
                className={`curtain${curtain.settle ? ' settle' : ''}${curtain.open ? ' is-open' : ''}`}
                id="curtain"
                role="button"
                tabIndex={0}
                aria-label={curtain.open ? 'Curtain open' : 'Open the curtain'}
                style={{ '--open': curtain.frac } as CSSProperties}
                onPointerDown={booth.onCurtainPointerDown}
                onPointerMove={booth.onCurtainPointerMove}
                onPointerUp={booth.onCurtainPointerUp}
                onPointerCancel={booth.onCurtainPointerCancel}
                onKeyDown={booth.onCurtainKeyDown}
              >
                <div className="curtain-panel left" />
                <div className="curtain-panel right" />
                <div className="curtain-rod" />
                <span className="curtain-hint">
                  Swipe or tap to open <Sparkles className="ico" size="1em" aria-hidden />
                </span>
              </div>
            </div>
            <p className="polaroid-cap">
              say cheese <Heart className="ico" size="1em" aria-hidden />
            </p>
          </div>

          {/* 3 small photo slots */}
          <div className="slots">
            {shots.map((shot, i) => (
              <PhotoSlot
                key={i}
                index={i}
                shot={shot}
                stickers={stickers[i]}
                selected={editing === i}
                onClick={() => void booth.clickSlot(i)}
              />
            ))}
          </div>
        </div>

        {/* filter buttons */}
        <div className="booth-tools">
          {FILTER_BUTTONS.map((f) => (
            <button
              key={f.name}
              type="button"
              className="chip"
              aria-pressed={booth.filterName === f.name}
              onClick={() => booth.setFilter(f.name)}
            >
              {f.label}
            </button>
          ))}
          <button type="button" className="chip" id="crownToggle" aria-pressed={booth.crownOn} onClick={booth.toggleCrown}>
            <GoldCrown className="ico" /> Crown
          </button>
        </div>

        {/* sticker buttons */}
        <div className="booth-tools" aria-label="Stickers">
          <span className="tray-label">Stickers</span>
          {STICKER_BUTTONS.map((s) => (
            <button
              key={s.emoji}
              type="button"
              className="chip sticker-add"
              aria-label={`Add ${s.label} sticker`}
              onClick={() => booth.addSticker(s.emoji)}
            >
              {s.emoji}
            </button>
          ))}
          <button type="button" className="chip" id="stickerClear" onClick={booth.clearStickers}>
            Clear
          </button>
          <button
            type="button"
            className="chip"
            id="editRetake"
            hidden={editing === null}
            onClick={() => void booth.retakeEditing()}
          >
            Retake photo
          </button>
          <button type="button" className="chip" id="editDone" hidden={editing === null} onClick={booth.exitEdit}>
            Done
          </button>
        </div>

        {/* camera / upload buttons */}
        <div className="booth-tools">
          <button type="button" className="chip" id="curtainToggle" onClick={booth.toggleCurtain}>
            {curtain.open ? 'Close curtain' : 'Open curtain'}
          </button>
          <button type="button" className="chip" id="camStart" onClick={booth.openPhoneCam}>
            Take photo
          </button>
          <button type="button" className="chip" id="uploadBtn" onClick={booth.openUpload}>
            Upload photos
          </button>
          <button type="button" className="chip" id="boothClear" disabled={!booth.any} onClick={booth.clearPhotos}>
            Clear photos
          </button>
        </div>

        <p id="boothNote" role="status">
          {booth.note}
        </p>
      </div>

      {/* hidden file pickers (buttons above trigger them) */}
      <input
        type="file"
        id="shotInput"
        ref={booth.shotInputRef}
        accept="image/*"
        capture="user"
        hidden
        onChange={(e) => void booth.onShotInput(e)}
      />
      <input
        type="file"
        id="upload"
        ref={booth.uploadInputRef}
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void booth.onUploadInput(e)}
      />
    </Panel>
  );
}
