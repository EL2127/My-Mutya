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

/** Column of numbered buttons. The numbers come from a CSS counter. */
export default function SideNav({ side, items, activeId, onGo }: SideNavProps) {
  return (
    <nav className={`side ${side}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === activeId ? 'active' : ''}
          onClick={() => onGo(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
