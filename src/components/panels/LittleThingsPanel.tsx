// src/components/panels/LittleThingsPanel.tsx
import Panel from './Panel';

interface LittleThingsPanelProps {
  active: boolean;
  items: string[];
}

export default function LittleThingsPanel({ active, items }: LittleThingsPanelProps) {
  return (
    <Panel id="little" active={active}>
      <h2>Little Things I Love</h2>
      <ul id="littleList">
        {items.map((text, i) => (
          <li key={text} style={{ animationDelay: `${i * 0.2}s` }}>
            {text}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
