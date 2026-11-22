// src/components/SideNav.tsx
import type { PanelId } from '../types';

export interface NavItem {
  id: PanelId;
  label: string;
}

interface SideNavProps {
  side: 'left' | 'right';
  items: NavItem[];
  activeId: PanelId;
  onGo: (id: PanelId) => void;
}

/**
 * Numbered buttons: a horizontal row on phones, a vertical column from `md` up.
 * The numbers 1-6 come from a CSS counter (`counter-reset: tag`), which must be set
 * on a common ancestor of both navs (see the layout wrapper in App.tsx).
 */
export default function SideNav({ side, items, activeId, onGo }: SideNavProps) {
  return (
    <nav
      className={`side ${side} d-flex flex-row flex-md-column gap-1 gap-md-3 h-100`}
      aria-label={side === 'left' ? 'Left menu' : 'Right menu'}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type='button'
          className={`flex-fill${item.id === activeId ? ' active' : ''}`}
          style={{ minWidth: 0 }}
          aria-current={item.id === activeId ? 'page' : undefined}
          onClick={() => onGo(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}