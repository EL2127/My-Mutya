// src/hooks/useBackgroundVideo.ts
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface BackgroundVideo {
  videoRef: RefObject<HTMLVideoElement>;
  /** Fades the video in (once it can play) and starts it. Safe to call many times. */
  showVideo: () => void;
  onError: () => void;
}

/**
 * Controls the full-screen background video. When it can play, the `has-video`
 * class is added to <body>; the CSS uses it to fade the video in.
 */
export function useBackgroundVideo(src: string): BackgroundVideo {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('has-video', hasVideo);
    return () => document.body.classList.remove('has-video');
  }, [hasVideo]);

  const showVideo = useCallback(function show(): void {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) {
      setHasVideo(true);
      video.play().catch(() => {});
    } else {
      // Not ready yet: try again as soon as the browser can play it
      video.addEventListener('canplay', show, { once: true });
    }
  }, []);

  const onError = useCallback((): void => {
    const code = videoRef.current?.error?.code ?? '?';
    console.warn('Video error code:', code, '- check', src);
  }, [src]);

  return { videoRef, showVideo, onError };
}
