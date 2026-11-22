// src/components/panels/HomePanel.tsx
import Panel from './Panel';

export default function HomePanel({ active }: { active: boolean }) {
  return (
    <Panel id="home" active={active}>
      <h1>Welcome, My Mutya 👑</h1>
      <p>Pick a button on the sides, or press Next.</p>
    </Panel>
  );
}
