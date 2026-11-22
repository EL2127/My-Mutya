// src/components/Jukebox.tsx
import type { KeyboardEvent } from 'react';
import type { Track } from '../types';

interface JukeboxProps {
  hidden: boolean;
  tracks: Track[];
  trackIndex: number;
  playing: boolean;
  title: string;
  onToggle: () => void;
  onSelect: (index: number) => void;
}

/** Tap the CD and it slides into the jukebox; the CSS "playing" class does the animation. */
export default function Jukebox({ hidden, tracks, trackIndex, playing, title, onToggle, onSelect }: JukeboxProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={`jukebox${playing ? ' playing' : ''}`} id="jukebox" hidden={hidden}>
      <div className="jb-tracks" id="jbTracks">
        {tracks.map((t, i) => (
          <button key={t.title} type="button" aria-pressed={i === trackIndex} onClick={() => onSelect(i)}>
            {t.title}
          </button>
        ))}
      </div>
      <div
        className="jb-cd"
        role="button"
        tabIndex={0}
        aria-label="Insert the CD to play music"
        onClick={onToggle}
        onKeyDown={onKeyDown}
      />
      <div
        className="jb-box"
        role="button"
        tabIndex={0}
        aria-label="Jukebox: play or pause the music"
        onClick={onToggle}
        onKeyDown={onKeyDown}
      >
        <div className="jb-window">
          <div className="jb-disc" />
        </div>
        <span className="jb-title" id="jbTitle">
          {title}
        </span>
      </div>
    </div>
  );
}
