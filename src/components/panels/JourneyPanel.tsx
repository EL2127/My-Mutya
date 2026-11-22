// src/components/panels/JourneyPanel.tsx
import { elapsedSince, ordinal } from '../../utils/time';
import Panel from './Panel';

interface JourneyPanelProps {
  active: boolean;
  startDate: string;
}

/** Counts years, months and days since you became a couple. Recomputed on every render. */
export default function JourneyPanel({ active, startDate }: JourneyPanelProps) {
  const { years, months, days, totalMonths } = elapsedSince(startDate);

  return (
    <Panel id="years" active={active}>
      <h2>Our Journey</h2>
      <div id="counter" className="counter">
        <div>
          <b>{years}</b>year(s)
        </div>
        <div>
          <b>{months}</b>month(s)
        </div>
        <div>
          <b>{days}</b>total days
        </div>
      </div>
      <p id="monthsary">Happy {ordinal(totalMonths)} monthsary, love!</p>
    </Panel>
  );
}
