  // src/components/panels/BoothPanel.tsx
  import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ChangeEvent } from 'react';
  import { usePhotoBooth } from '../../hooks/usePhotoBooth';
  import { FILTERS, H, W, type FilterName, type Sticker } from '../../utils/canvas';
  import Panel from './Panel';
  import PhotoSlot from './PhotoSlot';
  import { Download, Heart, Sparkles, Undo2, ImagePlus } from 'lucide-react';
  import GoldCrown from '../GoldCrown';

  interface BoothPanelProps {
    active: boolean;
    herName: string;
    onBurst: () => void;
    onShowVideo: () => void;
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
    { emoji: '/sticker/custom1.png', label: 'custom1' },
    { emoji: '/sticker/custom2.png', label: 'custom2' },
  ];

  export default function BoothPanel({ active, herName, onBurst, onShowVideo, onReset }: BoothPanelProps) {
    const [showStickers, setShowStickers] = useState(false);
    const booth = usePhotoBooth({ herName, active, onBurst, onShowVideo });
    const { editing, curtain, live, shots, stickers } = booth;
    const editCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // Ref para sa custom image upload
    const customStickerRef = useRef<HTMLInputElement>(null);

    // Show the photo being edited on the big canvas
    useEffect(() => {
      const ctx = editCanvasRef.current?.getContext('2d');
      if (!ctx || editing === null) return;
      const shot = shots[editing];
      ctx.clearRect(0, 0, W, H);
      if (shot) ctx.drawImage(shot, 0, 0);
    }, [editing, shots]);

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

    // Function para i-convert ang uploaded file into Data URL tapos ipasa sa addSticker
    const handleCustomSticker = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        booth.addSticker(base64);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    };

    const editingStickers = editing === null ? [] : stickers[editing];

    return (
      <Panel id="booth" active={active}>
        {/* Outer physical cabinet */}
        <div className={`booth-cabinet${editing !== null ? ' editing-mode' : ''}`}>
          
          {/* Marquee Sign / Header */}
          <div className="booth-marquee">
            <span>★ MUTYA PHOTOBOOTH ★</span>
          </div>

          <div className="booth">
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

            {/* Inner mechanical area with screen and dispenser */}
            <div className={`booth-chassis${editing !== null ? ' has-image' : ''}`}>
              <div className="booth-grid">
                
                {/* Big screen */}
                <div className="polaroid">
                  <div className={`viewfinder${editing !== null ? ' editing' : ''}`} id="viewfinder" ref={booth.viewfinderRef}>
                    {/* Camera Grid Overlay */}
                    <div className="camera-grid-overlay">
                      <div className="crosshair-h" />
                      <div className="crosshair-v" />
                      <div className="rec-dot" />
                    </div>

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
                          {s.emoji.startsWith('http') || s.emoji.startsWith('data:') || s.emoji.startsWith('/') ? (
                            <img 
                              src={s.emoji} 
                              alt="sticker" 
                              draggable={false} 
                              style={{ width: '80px', height: '80px', objectFit: 'contain', pointerEvents: 'none' }} 
                            />
                          ) : (
                            s.emoji
                          )}
                        </span>
                      ))}
                    </div>

                    <div className="vf-count" id="vfCount" hidden={booth.count === null}>
                      {booth.count}
                    </div>
                    <div key={booth.flashKey} className={`vf-flash${booth.flashKey ? ' go' : ''}`} id="vfFlash" />
                    <button
                      type="button"
                      className="shutter"
                      id="shutter"
                      aria-label="Take photos"
                      disabled={booth.busy}
                      onClick={() => void booth.shutter()}
                    />

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

                {/* Photo dispenser slot */}
                <div className="booth-dispenser">
                  <div className="dispenser-mouth"></div>
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

              </div>

              {/* Quick Actions directly under the screen/slots */}
              <div className="booth-quick-actions">
                <button type="button" className="chip" id="camStart" onClick={booth.openPhoneCam}>
                  Take photo
                </button>
                <button type="button" className="chip" id="uploadBtn" onClick={booth.openUpload}>
                  Upload photos
                </button>
              </div>
            </div>

            {/* Control Deck (Bottom) */}
            <div className="booth-control-deck">
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

              <div className="booth-tools" aria-label="Stickers">
                <button type="button" className="chip" onClick={() => setShowStickers(!showStickers)}>
                  {showStickers ? 'Close Stickers' : 'Choose Stickers'}
                </button>

                {/* Custom Image Upload Button */}
                <button 
                  type="button" 
                  className="chip" 
                  onClick={() => customStickerRef.current?.click()}
                  title="Upload custom image sticker"
                >
                  <ImagePlus size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Custom Sticker
                </button>

                {/* Hidden Input para sa Custom Sticker */}
                <input
                  type="file"
                  ref={customStickerRef}
                  accept="image/*"
                  hidden
                  onChange={handleCustomSticker}
                />

                {/* Smooth Slide Down container for Stickers */}
                <div className={`sticker-tray-container ${showStickers ? 'open' : ''}`}>
                  <div className="sticker-tray-inner">
                    {STICKER_BUTTONS.map((s) => {
                      const isImage = s.emoji.startsWith('http') || s.emoji.startsWith('data:') || s.emoji.startsWith('/');
                      return (
                        <button
                          key={s.emoji}
                          type="button"
                          className="chip sticker-add"
                          aria-label={`Add ${s.label} sticker`}
                          onClick={() => booth.addSticker(s.emoji)}
                        >
                          {isImage ? (
                            <img src={s.emoji} alt={s.label} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          ) : (
                            s.emoji
                          )}
                        </button>
                      );
                    })}
                    <button type="button" className="chip" id="stickerClear" onClick={booth.clearStickers}>
                      Clear
                    </button>
                  </div>
                </div>

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

              <div className="booth-tools">
                <button type="button" className="chip" id="curtainToggle" onClick={booth.toggleCurtain}>
                  {curtain.open ? 'Close curtain' : 'Open curtain'}
                </button>
                <button type="button" className="chip" id="boothClear" disabled={!booth.any} onClick={booth.clearPhotos}>
                  Clear photos
                </button>
              </div>

              <p id="boothNote" role="status">
                {booth.note}
              </p>
            </div>
          </div>
        </div>

        {/* hidden file pickers */}
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