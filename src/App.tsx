// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { CONFIG } from './config';
import { PANEL_ORDER } from './constants';
import type { PanelId } from './types';
import { useBackgroundVideo } from './hooks/useBackgroundVideo';
import { useConfetti } from './hooks/useConfetti';
import { useJukebox } from './hooks/useJukebox';
import Jukebox from './components/Jukebox';
import SideNav, { type NavItem } from './components/SideNav';
import StartScreen from './components/StartScreen';
import TopBar from './components/TopBar';
import BoothPanel from './components/panels/BoothPanel';
import CrownPanel from './components/panels/CrownPanel';
import HighlightsPanel from './components/panels/HighlightsPanel';
import HomePanel from './components/panels/HomePanel';
import JourneyPanel from './components/panels/JourneyPanel';
import LetterPanel from './components/panels/LetterPanel';
import LittleThingsPanel from './components/panels/LittleThingsPanel';

type Phase = 'start' | 'lifting' | 'app';

const LEFT_NAV: NavItem[] = [
  { id: 'crown', label: 'The Crown' },
  { id: 'years', label: 'Our Journey' },
  { id: 'little', label: 'Little Things' },
];
const RIGHT_NAV: NavItem[] = [
  { id: 'booth', label: 'Photo Booth' },
  { id: 'letter', label: 'Love Letter' },
  { id: 'highlights', label: 'Highlights' },
];

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [current, setCurrent] = useState<number>(0);
  const [glassMode, setGlassMode] = useState<boolean>(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('glass-theme', glassMode);
  }, [glassMode]);

  const bg = useBackgroundVideo(CONFIG.backgroundVideo);
  const { canvasRef, burst } = useConfetti();
  const jukebox = useJukebox(CONFIG.music);
  const hasMusic = CONFIG.music.length > 0;

  const activeId: PanelId = PANEL_ORDER[current];
  const is = (id: PanelId): boolean => activeId === id;

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  /** Start screen -> app. The tap counts as a user gesture, so music is allowed to start. */
  const begin = (): void => {
    if (phase !== 'start') return;
    setPhase('lifting');
    jukebox.startFromGesture();
    burst();
    bg.showVideo();
    timer.current = window.setTimeout(() => setPhase('app'), 800);
  };

  const go = (index: number): void =>
    setCurrent(Math.max(0, Math.min(PANEL_ORDER.length - 1, index)));
  const goTo = (id: PanelId): void => go(PANEL_ORDER.indexOf(id));

  return (
    <>
      {/* background video (fades in when ready) */}
      <video
        id='bgVideo'
        ref={bg.videoRef}
        src={CONFIG.backgroundVideo || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        onError={bg.onError}
      />
      <div className='bg-shade' id='bgShade' />

      {/* background music */}
      <audio id='bgMusic' ref={jukebox.audioRef} preload='auto' {...jukebox.audioProps} />
      <Jukebox
        hidden={!hasMusic || phase !== 'app'}
        tracks={CONFIG.music}
        trackIndex={jukebox.trackIndex}
        playing={jukebox.playing}
        title={jukebox.title}
        onToggle={jukebox.toggle}
        onSelect={jukebox.select}
      />

      <StartScreen active={phase !== 'app'} lifting={phase === 'lifting'} onBegin={begin} />

      <main
        id='app'
        className={`screen${phase === 'app' ? ' active' : ''} pt-5 mt-4 pt-md-4 mt-md-0`}
      >
        <TopBar current={current} />

        {/* Global Theme Toggle Button */}
        <button
          type='button'
          className='theme-toggle-btn'
          onClick={() => setGlassMode(!glassMode)}
          title='Toggle Transparent Buttons'
        >
          {glassMode ? 'Solid Mode' : 'Glass Mode'}
        </button>

        {/* counterReset must live on a common ancestor so keys count 1-6 across both navs */}
        <div
          className='container-fluid px-0 mx-auto w-100'
          style={{ maxWidth: 900, counterReset: 'tag' }}
        >
          <div className='row g-2 g-md-3 align-items-stretch'>
            <div className='col-6 col-md-2 order-1'>
              <SideNav side='left' items={LEFT_NAV} activeId={activeId} onGo={goTo} />
            </div>

            <div className='col-12 col-md-8 order-3 order-md-2'>
              <div className='stage h-100'>
                <HomePanel active={is('home')} />
                <CrownPanel active={is('crown')} onBurst={burst} />
                <JourneyPanel active={is('years')} startDate={CONFIG.startDate} />
                <LittleThingsPanel active={is('little')} items={CONFIG.littleThings} />
                <BoothPanel
                  active={is('booth')}
                  herName={CONFIG.herName}
                  onBurst={burst}
                  onShowVideo={bg.showVideo}
                  onReset={() => go(0)}
                />
                <LetterPanel active={is('letter')} letter={CONFIG.letter} />
                <HighlightsPanel active={is('highlights')} photos={CONFIG.photos} />

                {/* Back / Next under the stage */}
                <div className='stage-nav'>
                  <button
                    type='button'
                    id='back'
                    disabled={current === 0}
                    onClick={() => go(current - 1)}
                  >
                    Back
                  </button>
                  <button
                    type='button'
                    id='next'
                    disabled={current === PANEL_ORDER.length - 1}
                    onClick={() => go(current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-2 order-2 order-md-3'>
              <SideNav side='right' items={RIGHT_NAV} activeId={activeId} onGo={goTo} />
            </div>
          </div>
        </div>
      </main>

      {/* full-screen canvas for confetti */}
      <canvas id='confetti' ref={canvasRef} />
    </>
  );
}