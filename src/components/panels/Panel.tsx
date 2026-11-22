// src/components/panels/Panel.tsx
import type { ReactNode } from 'react';
import type { PanelId } from '../../types';

interface PanelProps {
  id: PanelId;
  active: boolean;
  children: ReactNode;
}

/**
 * Every panel stays mounted; only the one with "active" is shown (CSS display).
 * That keeps photos, the typed letter, etc. when you move between pages,
 * and the CSS fade-in replays each time a panel is shown.
 */
export default function Panel({ id, active, children }: PanelProps) {
  return (
    <div className={`panel${active ? ' active' : ''}`} id={id}>
      {children}
    </div>
  );
}
