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
    <section
      id="start"
      className={`screen align-items-center justify-content-center px-3${active ? ' active' : ''}`}
      onClick={onBegin}
    >
      {/* Background Video (naka-transparent at nag-fa-fade in) */}
      {lifting && (
        <video
          className="start-bg-video w-100 h-100"
          src={CONFIG.startVideo}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Curtain Animation */}
      <div className={`start-curtain d-flex w-100 h-100${lifting ? ' open' : ''}`}>
        <div className="start-curtain-panel left" />
        <div className="start-curtain-panel right" />
      </div>

      <button
        id="crownStart" 
        type="button"
        className={`btn p-0 border-0 shadow-none${lifting ? ' lift' : ''}`}
        aria-label="Click to start"
      >
        <GoldCrown />
      </button>
      <p className="start-text mb-0 text-center">Tap the crown to begin</p>
    </section>
  );
}