// src/components/panels/CrownPanel.tsx
import type { KeyboardEvent } from 'react';
import Panel from './Panel';
import GoldCrown from '../GoldCrown';


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
        className="crown-big mx-auto"
        id="crownBtn"
        role="button"
        tabIndex={0}
        aria-label="Throw confetti"
        onClick={onBurst}
        onKeyDown={onKeyDown}
      >
        <GoldCrown />
      </div>
      <h2 className="mb-0">My Mutya</h2>
      <p className="crown-line mb-0">Proud of you, always.</p>
      <p className="crown-hint mb-0">Tap the crown for confetti</p>
    </Panel>
  );
}
