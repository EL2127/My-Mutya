// src/hooks/useJukebox.ts
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Track } from '../types';

function sourcesFor(track: Track): string[] {
  return track.src;
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
  const audioRef = useRef<HTMLAudioElement>(null!);
  const tracksRef = useRef<Track[]>(tracks);
  tracksRef.current = tracks;

  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const trackIndexRef = useRef(0);
  const sourceTry = useRef(0);
  const wantPlay = useRef(false);
  const loadSeq = useRef(0);
  const initialized = useRef(false);

  const onPlayError = useCallback((err: unknown): void => {
    // Ignore AbortError caused by rapid track switching / load()
    if (err instanceof DOMException && err.name === 'AbortError') return;
    console.warn('Play failed:', err);
    const name = err instanceof DOMException ? err.name : '';
    setHint(name === 'NotSupportedError' ? 'Song not found' : 'Tap again');
  }, []);

  const safePlay = useCallback(
    (audio: HTMLAudioElement, seq: number): void => {
      audio
        .play()
        .then(() => {
          if (seq !== loadSeq.current) return;
          setPlaying(true);
          setHint(null);
        })
        .catch((err: unknown) => {
          if (seq !== loadSeq.current) return;
          onPlayError(err);
        });
    },
    [onPlayError],
  );

  const loadTrack = useCallback(
    (i: number, autoplay: boolean): void => {
      const audio = audioRef.current;
      const list = tracksRef.current;
      if (!audio || list.length === 0) return;

      const seq = ++loadSeq.current;
      const idx = ((i % list.length) + list.length) % list.length;

      trackIndexRef.current = idx;
      setTrackIndex(idx);
      sourceTry.current = 0;
      setFailed(false);
      setHint(null);
      wantPlay.current = autoplay;

      // Pause first so overlapping audio streams never stack
      audio.pause();

      const options = sourcesFor(list[idx]);
      if (!options || options.length === 0) {
        setFailed(true);
        return;
      }

      audio.src = options[0];
      audio.load();

      if (autoplay) {
        safePlay(audio, seq);
      }
    },
    [safePlay],
  );

  // Load the first song and set volume once on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracksRef.current.length === 0 || initialized.current) return;
    initialized.current = true;
    audio.volume = 0.6;
    loadTrack(0, false);
  }, [loadTrack]);

  const onError = useCallback((): void => {
    const audio = audioRef.current;
    const list = tracksRef.current;
    if (!audio || list.length === 0) return;

    const seq = loadSeq.current;
    const options = sourcesFor(list[trackIndexRef.current]);

    if (sourceTry.current < options.length - 1) {
      sourceTry.current++;
      audio.pause();
      audio.src = options[sourceTry.current];
      audio.load();
      if (wantPlay.current) {
        safePlay(audio, seq);
      }
      return;
    }

    console.warn('Music error code:', audio.error?.code ?? '?', '- tried:', options.join('  |  '));
    setFailed(true);
    setPlaying(false);
  }, [safePlay]);

  const toggle = useCallback((): void => {
    const audio = audioRef.current;
    const list = tracksRef.current;
    if (!audio || list.length === 0) return;

    const seq = ++loadSeq.current;

    if (audio.ended) {
      audio.currentTime = 0;
    }

    if (audio.paused) {
      wantPlay.current = true;
      if (!audio.src) {
        loadTrack(trackIndexRef.current, true);
        return;
      }
      safePlay(audio, seq);
    } else {
      wantPlay.current = false;
      audio.pause();
    }
  }, [loadTrack, safePlay]);

  const select = useCallback(
    (index: number): void => {
      const audio = audioRef.current;
      if (!audio) return;

      if (index === trackIndexRef.current && !audio.paused) {
        wantPlay.current = false;
        audio.pause();
      } else {
        loadTrack(index, true);
      }
    },
    [loadTrack],
  );

  const startFromGesture = useCallback((): void => {
    const audio = audioRef.current;
    const list = tracksRef.current;
    if (!audio || list.length === 0) return;

    // Only start if nothing is currently playing yet
    if (!audio.paused) return;

    const seq = ++loadSeq.current;
    wantPlay.current = true;
    if (!audio.src) {
      loadTrack(trackIndexRef.current, true);
      return;
    }
    safePlay(audio, seq);
  }, [loadTrack, safePlay]);

  const audioProps = {
    onError,
    onEnded: () => {
      const list = tracksRef.current;
      if (list.length === 0) return;

      if (trackIndexRef.current === list.length - 1) {
        const audio = audioRef.current;
        ++loadSeq.current;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.src = sourcesFor(list[0])[0];
          audio.load();
        }
        setPlaying(false);
        setTrackIndex(0);
        trackIndexRef.current = 0;
        wantPlay.current = false;
        setHint('Playlist finished');
      } else {
        loadTrack(trackIndexRef.current + 1, true);
      }
    },
    onPlay: () => {
      setPlaying(true);
      setHint(null);
    },
    onPause: () => {
      setPlaying(false);
    },
  };

  const current = tracks[trackIndex];
  const title = failed
    ? 'Song not found'
    : hint ?? (playing && current ? `Now playing: ${current.title}` : 'Tap the CD');

  return { audioRef, audioProps, trackIndex, playing, title, toggle, select, startFromGesture };
}