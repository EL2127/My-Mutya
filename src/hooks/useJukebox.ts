// src/hooks/useJukebox.ts
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Track } from '../types';

const DRIVE_RE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]+)/;

/** One link or file name -> the links to try. A Google Drive share link becomes two direct download links. */
function expand(src: string): string[] {
  const m = src.match(DRIVE_RE);
  if (!m) return [src];
  return [
    `https://drive.google.com/uc?export=download&id=${m[1]}`,
    `https://drive.usercontent.google.com/download?id=${m[1]}&export=download&confirm=t`,
  ];
}

/**
 * Everything we can try for one song, in order: its src (file names or links),
 * then its optional drive link as a backup. If one fails to load, the next one is tried.
 */
function sourcesFor(track: Track): string[] {
  return [...track.src, ...(track.drive ? [track.drive] : [])].flatMap(expand);
}

interface Jukebox {
  audioRef: RefObject<HTMLAudioElement>;
  /** Spread these on the <audio> element. */
  audioProps: {
    onError: () => void;
    onEnded: () => void;
    onPlay: () => void;
    onPause: () => void;
  };
  trackIndex: number;
  playing: boolean;
  title: string;
  /** Play or pause (the CD / the box). */
  toggle: () => void;
  /** Tapping a song button: pause it if it is the current song and playing, otherwise play it. */
  select: (index: number) => void;
  /** Call from the first user tap; the tap counts as a gesture so autoplay is allowed. */
  startFromGesture: () => void;
}

export function useJukebox(tracks: Track[]): Jukebox {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false); // every file and link for the song failed
  const [hint, setHint] = useState<string | null>(null);

  const trackIndexRef = useRef(0);
  const sourceTry = useRef(0); // which link we are trying for the current song
  const wantPlay = useRef(false); // once the person asked for music, a fallback link keeps playing

  const onPlayError = useCallback((err: unknown): void => {
    console.warn('Play failed:', err);
    const name = err instanceof DOMException ? err.name : '';
    setHint(name === 'NotSupportedError' ? 'Song not found' : 'Tap again');
  }, []);

  const loadTrack = useCallback(
    (i: number, autoplay: boolean): void => {
      const audio = audioRef.current;
      if (!audio || tracks.length === 0) return;
      const idx = (i + tracks.length) % tracks.length; // wraps around at both ends
      trackIndexRef.current = idx;
      setTrackIndex(idx);
      sourceTry.current = 0;
      setFailed(false);
      setHint(null);
      if (autoplay) wantPlay.current = true;
      audio.src = sourcesFor(tracks[idx])[0];
      audio.load();
      if (autoplay) audio.play().catch(onPlayError);
    },
    [tracks, onPlayError],
  );

  // Load the first song and set the volume once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    audio.volume = 0.6;
    loadTrack(0, false);
  }, [tracks, loadTrack]);

  const onError = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    const options = sourcesFor(tracks[trackIndexRef.current]);
    if (sourceTry.current < options.length - 1) {
      // This file or link failed: try the next one before giving up
      sourceTry.current++;
      audio.src = options[sourceTry.current];
      audio.load();
      if (wantPlay.current) audio.play().catch(onPlayError);
      return;
    }
    console.warn('Music error code:', audio.error?.code ?? '?', '- tried:', options.join('  |  '));
    setFailed(true);
  }, [tracks, onPlayError]);

  const toggle = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio) return;
    wantPlay.current = audio.paused;
    if (audio.paused) audio.play().catch(onPlayError);
    else audio.pause();
  }, [onPlayError]);

  const select = useCallback(
    (index: number): void => {
      const audio = audioRef.current;
      if (!audio) return;
      if (index === trackIndexRef.current && !audio.paused) audio.pause();
      else loadTrack(index, true);
    },
    [loadTrack],
  );

  const startFromGesture = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    wantPlay.current = true;
    audio.play().catch(() => {});
  }, [tracks]);

  const audioProps = {
    onError,
    onEnded: () => loadTrack(trackIndexRef.current + 1, true), // next song, loops the playlist
    onPlay: () => {
      setPlaying(true);
      setHint(null);
    },
    onPause: () => setPlaying(false),
  };

  const current = tracks[trackIndex];
  const title = failed
    ? 'Song not found'
    : hint ?? (playing && current ? `Now playing: ${current.title}` : 'Tap the CD');

  return { audioRef, audioProps, trackIndex, playing, title, toggle, select, startFromGesture };
}
