// src/components/panels/HighlightsPanel.tsx
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Panel from './Panel';
import { CONFIG } from '../../config';

const PLACEHOLDER_COUNT = 6;
const AUTOPLAY_MS = 4000;
const SWIPE_PX = 40;

interface HighlightsPanelProps {
  active: boolean;
  photos?: string[];
}

export default function HighlightsPanel({ active, photos = [] }: HighlightsPanelProps) {
  const [seed] = useState(() => Math.random().toString(36).slice(2, 8));
  
  // 1. MAIN HIGHLIGHTS (Yung mga totoong pictures mo)
  const slides = photos.length > 0 
    ? photos 
    : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/600/750`);
  const count = slides.length;

  // 2. RANDOM IMAGES (Para sa popup modal)
  const randomSlides = CONFIG.carouselPhotos || [];
  const [bgIndex, setBgIndex] = useState(0);
  const [showRandom, setShowRandom] = useState(false); 

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  const go = (i: number): void => setIndex(((i % count) + count) % count);

  // Autoplay para sa Main Highlights
  useEffect(() => {
    if (!active || paused || count < 2 || showRandom) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [active, paused, count, index, showRandom]);

  // Autoplay para sa Random Images (tatakbo lang kapag nakabukas ang modal)
  useEffect(() => {
    if (!showRandom || randomSlides.length < 2) return;
    const id = window.setInterval(() => setBgIndex((i) => (i + 1) % randomSlides.length), 1000);
    return () => window.clearInterval(id);
  }, [showRandom, randomSlides.length]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>): void => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (dx <= -SWIPE_PX) go(index + 1);
    else if (dx >= SWIPE_PX) go(index - 1);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <Panel id="highlights" active={active}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Highlights</h2>

      {/* --- MAIN CAROUSEL (Naka-inline styles para hindi magulo) --- */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Highlight photos"
        tabIndex={0}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          startX.current = null;
          setPaused(false);
        }}
        onKeyDown={onKeyDown}
      >
        <div
          style={{
            display: 'flex',
            transition: 'transform 0.4s ease-in-out',
            transform: `translateX(-${index * 100}%)`,
            height: '500px', // Sakto sa box
          }}
        >
          {slides.map((src, i) => (
            <div key={src} style={{ flex: '0 0 100%', height: '100%' }} aria-hidden={i !== index}>
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>

        <button 
          type="button" 
          className="carousel-btn prev" 
          aria-label="Previous photo" 
          onClick={() => go(index - 1)}
          style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 10 }}
        >
          <ChevronLeft aria-hidden />
        </button>
        <button 
          type="button" 
          className="carousel-btn next" 
          aria-label="Next photo" 
          onClick={() => go(index + 1)}
          style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 10 }}
        >
          <ChevronRight aria-hidden />
        </button>
      </div>

      {/* --- DOTS (Inayos ang alignment) --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: i === index ? '#800000' : '#ccc',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>

      {/* --- BUTTON PARA LUMABAS ANG RANDOM IMAGES --- */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowRandom(true)}
          style={{
            padding: '10px 24px',
            borderRadius: '25px',
            backgroundColor: '#800000', // Dark red
            color: '#ffcc00', // Gold
            border: '1px solid #ffcc00',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          View Random Photos
        </button>
      </div>

      {/* --- RANDOM IMAGES MODAL POPUP (Nasa Portal para siguradong buong screen) --- */}
      {showRandom && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(10, 0, 0, 0.95)', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setShowRandom(false)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'transparent',
              border: 'none',
              color: '#ffcc00',
              cursor: 'pointer',
              zIndex: 100000,
            }}
          >
            <X size={40} />
          </button>

          <h3 style={{ color: '#ffcc00', fontSize: '2rem', marginBottom: '30px', fontFamily: 'serif', fontStyle: 'italic' }}>
            Random Memories
          </h3>

          {/* Random Images Track */}
          <div style={{ width: '100vw', overflow: 'hidden', padding: '40px 0' }}>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                transition: 'transform 1s linear', // <-- Binago para sumabay sa bilis
                transform: `translateX(-${bgIndex * 220}px)`,
                paddingLeft: '10vw', // Naka-center sa screen
              }}
            >
              {randomSlides.map((src, i) => (
                <div
                  key={src}
                  style={{
                    width: '200px',
                    flexShrink: 0,
                    transform: `translateY(${i % 3 === 0 ? '-20px' : i % 3 === 1 ? '10px' : '20px'})`,
                  }}
                >
                  <div
                    style={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      aspectRatio: '3 / 4',
                      border: '1px solid rgba(255, 204, 0, 0.3)',
                    }}
                  >
                    <img
                      src={src}
                      alt="Random"
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body 
      )}
    </Panel>
  );
}