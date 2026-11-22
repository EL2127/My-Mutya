// src/components/panels/CrownPanel.tsx
import type { KeyboardEvent } from 'react';
import Panel from './Panel';

interface CrownPanelProps {
  active: boolean;
  onBurst: () => void;
}

export default function CrownPanel({ active, onBurst }: CrownPanelProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') onBurst();
  };

  return (
    <Panel id="crown" active={active}>
      <div
        className="crown-big"
        id="crownBtn"
        role="button"
        tabIndex={0}
        aria-label="Throw confetti"
        onClick={onBurst}
        onKeyDown={onKeyDown}
      >
        👑
      </div>
      <h2>My Mutya</h2>
      <p className="crown-line">Proud of you, always.</p>
      <p className="crown-hint">Tap the crown for confetti</p>
    </Panel>
  );
}
