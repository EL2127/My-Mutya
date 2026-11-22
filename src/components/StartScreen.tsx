// src/components/StartScreen.tsx
import GoldCrown from './GoldCrown';
import { CONFIG } from '../config';

interface StartScreenProps {
  /** Screen is shown (true until the app screen takes over). */
  active: boolean;
  /** The crown is floating up (animation running). */
  lifting: boolean;
  onBegin: () => void;
}

/** Screen 1: the big crown. Tapping anywhere starts the app. */
export default function StartScreen({ active, lifting, onBegin }: StartScreenProps) {
  return (
    <section id="start" className={`screen${active ? ' active' : ''}`} onClick={onBegin}>
      
      {/* Background Video (naka-transparent at nag-fa-fade in) */}
      {lifting && (
        <video
          className="start-bg-video"
          src={CONFIG.startVideo}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Curtain Animation */}
      <div className={`start-curtain ${lifting ? 'open' : ''}`}>
        <div className="start-curtain-panel left" />
        <div className="start-curtain-panel right" />
      </div>

      <button id="crownStart" type="button" className={lifting ? 'lift' : ''} aria-label="Click to start">
        <GoldCrown />
      </button>
      <p className="start-text">Tap the crown to begin</p>
    </section>
  );
}