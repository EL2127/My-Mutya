// src/hooks/usePhotoBooth.ts
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  H,
  W,
  buildStrip,
  canvasToBlob,
  composite,
  grab,
  loadImage,
  type FilterName,
  type Sticker,
} from '../utils/canvas';
import { wait } from '../utils/time';

type Shots = (HTMLCanvasElement | null)[];

interface CurtainState {
  open: boolean;
  /** 0 = closed, 1 = open. The CSS slides the panels using this. */
  frac: number;
  /** When true the panels animate; false while the finger is dragging. */
  settle: boolean;
}

interface CurtainDrag {
  x: number;
  moved: boolean;
  frac: number;
  half: number;
}

interface Options {
  herName: string;
  /** True while the Photo Booth page is the one on screen. Leaving it stops the camera. */
  active: boolean;
  onBurst: () => void;
  onShowVideo: () => void;
}

const MAX_STICKERS = 10;
const SLOT_COUNT = 3;

/**
 * All the photo booth state and actions: camera, 3-photo shoot, uploads,
 * stickers, curtain and saving the strip.
 */
export function usePhotoBooth({ herName, active, onBurst, onShowVideo }: Options) {
  const [shots, setShotsState] = useState<Shots>(() => Array<null>(SLOT_COUNT).fill(null));
  const [stickers, setStickers] = useState<Sticker[][]>(() => Array.from({ length: SLOT_COUNT }, () => []));
  const [filterName, setFilterNameState] = useState<FilterName>('normal');
  const [crownOn, setCrownOnState] = useState(true);
  const [live, setLive] = useState(false);
  const [busy, setBusyState] = useState(false);
  const [note, setNote] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [curtain, setCurtainState] = useState<CurtainState>({ open: false, frac: 0, settle: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const shotInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Refs mirror the state so the async loops (countdowns, shooting) never read stale values
  const streamRef = useRef<MediaStream | null>(null);
  const shotsRef = useRef<Shots>(shots);
  const busyRef = useRef(false);
  const filterRef = useRef<FilterName>('normal');
  const crownRef = useRef(true);
  const curtainOpenRef = useRef(false);
  const pendingSlot = useRef<number | null>(null);
  const curtainDrag = useRef<CurtainDrag | null>(null);
  const stickerId = useRef(0);
  const callbacks = useRef({ onBurst, onShowVideo });
  callbacks.current = { onBurst, onShowVideo };

  /* ---------- small state helpers ---------- */
  const commitShots = (next: Shots): void => {
    shotsRef.current = next;
    setShotsState(next);
  };
  const setBusy = (v: boolean): void => {
    busyRef.current = v;
    setBusyState(v);
  };
  const setShot = (i: number, canvas: HTMLCanvasElement): void => {
    const next = [...shotsRef.current];
    next[i] = canvas;
    commitShots(next);
    setStickers((prev) => prev.map((list, k) => (k === i ? [] : list)));
  };
  const clearShots = (): void => {
    commitShots(Array<null>(SLOT_COUNT).fill(null));
    setStickers(Array.from({ length: SLOT_COUNT }, () => []));
    exitEdit();
  };

  /* ---------- curtain ---------- */
  /** Opens or closes the curtain. The camera is never started here (native camera is used instead). */
  const setCurtain = (open: boolean, instant = false): void => {
    curtainOpenRef.current = open;
    setCurtainState({ open, frac: open ? 1 : 0, settle: !instant });
    if (open) callbacks.current.onShowVideo();
  };
  const toggleCurtain = (): void => setCurtain(!curtainOpenRef.current);

  const onCurtainPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if (curtainOpenRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setCurtainState((c) => ({ ...c, settle: false }));
    curtainDrag.current = {
      x: e.clientX,
      moved: false,
      frac: 0,
      half: e.currentTarget.getBoundingClientRect().width / 2,
    };
  };
  const onCurtainPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    const d = curtainDrag.current;
    if (!d) return;
    const dx = Math.abs(e.clientX - d.x);
    if (dx > 6) d.moved = true;
    d.frac = Math.min(1, dx / d.half);
    if (d.moved) setCurtainState((c) => ({ ...c, frac: d.frac }));
  };
  const onCurtainPointerUp = (): void => {
    const d = curtainDrag.current;
    if (!d) return;
    curtainDrag.current = null;
    // A tap (no drag) or a drag past 35% opens it, otherwise it springs shut
    setCurtain(!d.moved || d.frac > 0.35);
  };
  const onCurtainPointerCancel = (): void => {
    if (!curtainDrag.current) return;
    curtainDrag.current = null;
    setCurtain(false);
  };
  const onCurtainKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCurtain(true);
    }
  };

  /* ---------- camera ---------- */
  async function startCamera(): Promise<void> {
    if (streamRef.current) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera api');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setLive(true);
      setNote('Camera ready. Tap the round button.');
    } catch (err) {
      console.warn('Camera failed:', err);
      streamRef.current = null;
      setNote('The camera is blocked here. Tap the round button to use your phone camera, or Upload photos.');
    }
  }
  function stopCamera(): void {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  }
  const toggleCamera = (): void => {
    if (streamRef.current) {
      stopCamera();
      setNote('');
    } else {
      void startCamera();
    }
  };

  /* ---------- shooting ---------- */
  async function countdown(): Promise<void> {
    for (let n = 3; n >= 1; n--) {
      setCount(n);
      await wait(800);
    }
    setCount(null);
  }
  function shootVideo(i: number): void {
    const video = videoRef.current;
    if (!video) return;
    setShot(i, grab(video, video.videoWidth || W, video.videoHeight || H, true, filterRef.current, crownRef.current));
    setFlashKey((k) => k + 1);
  }
  const openPhoneCam = (): void => {
    const empty = shotsRef.current.findIndex((s) => !s);
    pendingSlot.current = empty === -1 ? 0 : empty;
    shotInputRef.current?.click();
  };

  /** The round button: opens the device's own camera app, one photo at a time. */
  const shutter = async (): Promise<void> => {
    if (busyRef.current) return;
    openPhoneCam();
  };

  /** Retake one photo with the live camera, or pick a new one when the camera is off. */
  const retakeSlot = async (i: number): Promise<void> => {
    if (streamRef.current && !busyRef.current) {
      setBusy(true);
      setNote(`Retaking photo ${i + 1}…`);
      await countdown();
      if (streamRef.current) shootVideo(i);
      setBusy(false);
      setNote('');
    } else {
      pendingSlot.current = i;
      shotInputRef.current?.click();
    }
  };

  /** Tap a slot: edit it if filled, otherwise take/choose a photo for it. */
  const clickSlot = async (i: number): Promise<void> => {
    if (busyRef.current) return;
    if (shotsRef.current[i]) {
      enterEdit(i);
      return;
    }
    await retakeSlot(i);
  };

  /* ---------- phone camera and uploads ---------- */
  const onShotInput = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const im = await loadImage(file);
      const i = pendingSlot.current ?? 0;
      pendingSlot.current = null;
      setShot(i, grab(im, im.naturalWidth, im.naturalHeight, false, filterRef.current, crownRef.current));
      const next = shotsRef.current.findIndex((s) => !s);
      if (next === -1) {
        setNote('All 3 photos are in! Tap the download icon to save your strip.');
        callbacks.current.onBurst();
      } else {
        setNote(`Photo ${i + 1} added. Tap the round button for photo ${next + 1}.`);
      }
    } catch {
      setNote("That photo couldn't be opened. Try another one.");
    }
  };
  const onUploadInput = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    // Copy the files first: clearing the input empties the live FileList
    const files = Array.from(e.target.files ?? []).slice(0, SLOT_COUNT);
    e.target.value = '';
    if (!files.length) return;
    try {
      for (let i = 0; i < files.length; i++) {
        const im = await loadImage(files[i]);
        setShot(i, grab(im, im.naturalWidth, im.naturalHeight, false, filterRef.current, crownRef.current));
      }
      setNote(
        shotsRef.current.every(Boolean)
          ? 'All 3 photos are in! Tap the download icon to save your strip.'
          : 'Added. Tap an empty box to add more.',
      );
    } catch {
      setNote("One of those photos couldn't be opened. Try another one.");
    }
  };
  const openUpload = (): void => uploadInputRef.current?.click();

  /* ---------- filters, crown ---------- */
  const setFilter = (name: FilterName): void => {
    filterRef.current = name;
    setFilterNameState(name);
  };
  const toggleCrown = (): void => {
    crownRef.current = !crownRef.current;
    setCrownOnState(crownRef.current);
  };

  /* ---------- stickers / editing ---------- */
  function enterEdit(i: number): void {
    setEditing(i);
    if (!curtainOpenRef.current) setCurtain(true);
    setNote(`Photo ${i + 1}: pick a sticker, then drag it where you want it. Double-click a sticker to remove it.`);
  }
  function exitEdit(): void {
    setEditing(null);
  }
  const retakeEditing = async (): Promise<void> => {
    if (editing === null) return;
    const i = editing;
    exitEdit();
    await retakeSlot(i);
  };

  const addSticker = (emoji: string): void => {
    if (editing === null) {
      setNote('Tap one of your photos first, then add stickers to it.');
      return;
    }
    if (stickers[editing].length >= MAX_STICKERS) {
      setNote("That's plenty of stickers! Clear some to add more.");
      return;
    }
    const sticker: Sticker = {
      id: ++stickerId.current,
      emoji,
      x: 0.25 + Math.random() * 0.5,
      y: 0.3 + Math.random() * 0.4,
    };
    setStickers((prev) => prev.map((list, k) => (k === editing ? [...list, sticker] : list)));
  };
  const clearStickers = (): void => {
    if (editing === null) {
      setNote('Tap one of your photos first.');
      return;
    }
    setStickers((prev) => prev.map((list, k) => (k === editing ? [] : list)));
  };
  const removeSticker = (id: number): void => {
    if (editing === null) return;
    setStickers((prev) => prev.map((list, k) => (k === editing ? list.filter((s) => s.id !== id) : list)));
  };
  const moveSticker = (id: number, x: number, y: number): void => {
    if (editing === null) return;
    setStickers((prev) =>
      prev.map((list, k) => (k === editing ? list.map((s) => (s.id === id ? { ...s, x, y } : s)) : list)),
    );
  };

  /* ---------- save ---------- */
  const saveStrip = async (): Promise<void> => {
    const frames = shotsRef.current.flatMap((s, i) => (s ? [composite(s, stickers[i])] : []));
    if (!frames.length) return;
    try {
      await document.fonts.load('34px Caveat'); // make sure the handwriting font is ready for the canvas
    } catch {
      /* the fallback font is fine */
    }
    try {
      const blob = await canvasToBlob(buildStrip(frames, herName));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'our-photobooth.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setNote('Saved! Check your downloads.');
    } catch (err) {
      console.warn('Save failed:', err);
      setNote("The strip couldn't be saved here.");
    }
  };

  const clearPhotos = (): void => {
    clearShots();
    setNote('');
  };

  /* ---------- leaving the page / unmounting ---------- */
  const leaveRef = useRef<() => void>(() => {});
  leaveRef.current = () => {
    stopCamera();
    if (curtainOpenRef.current) setCurtain(false, true);
    exitEdit();
  };
  useEffect(() => {
    if (!active) leaveRef.current();
  }, [active]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    },
    [],
  );

  const any = shots.some(Boolean);

  return {
    // state
    shots,
    stickers,
    filterName,
    crownOn,
    live,
    busy,
    note,
    count,
    flashKey,
    editing,
    curtain,
    any,
    // refs for the DOM
    videoRef,
    viewfinderRef,
    shotInputRef,
    uploadInputRef,
    // actions
    toggleCamera,
    openPhoneCam,
    toggleCurtain,
    shutter,
    clickSlot,
    onShotInput,
    onUploadInput,
    openUpload,
    setFilter,
    toggleCrown,
    addSticker,
    clearStickers,
    removeSticker,
    moveSticker,
    exitEdit,
    retakeEditing,
    saveStrip,
    clearPhotos,
    // curtain handlers
    onCurtainPointerDown,
    onCurtainPointerMove,
    onCurtainPointerUp,
    onCurtainPointerCancel,
    onCurtainKeyDown,
  };
}

export type PhotoBooth = ReturnType<typeof usePhotoBooth>;
