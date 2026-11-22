// src/components/TopBar.tsx
import { PANEL_ORDER } from '../constants';

interface TopBarProps {
  /** Index of the current page in PANEL_ORDER. */
  current: number;
}

/** Progress beads at the top (the home page has none). */
export default function TopBar({ current }: TopBarProps) {
  return (
    <div id="topbar">
      {PANEL_ORDER.slice(1).map((id, i) => (
        <span key={id} className={i + 1 < current ? 'done' : i + 1 === current ? 'current' : ''} />
      ))}
    </div>
  );
}
