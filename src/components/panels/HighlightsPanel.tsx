// src/components/panels/HighlightsPanel.tsx
import Panel from './Panel';

const PLACEHOLDER_COUNT = 6;

interface HighlightsPanelProps {
  active: boolean;
  /** Paths inside /public, e.g. 'images/1.jpg'. Empty = show numbered placeholders. */
  photos: string[];
}

export default function HighlightsPanel({ active, photos }: HighlightsPanelProps) {
  return (
    <Panel id="highlights" active={active}>
      <h2>Highlights ✨</h2>
      <div id="gallery" className="gallery">
        {photos.length > 0
          ? photos.map((src) => (
              <figure key={src}>
                <img src={src} alt="" />
              </figure>
            ))
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => <figure key={i}>Photo {i + 1}</figure>)}
      </div>
    </Panel>
  );
}
