// src/components/panels/LetterPanel.tsx
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { wait } from '../../utils/time';
import Panel from './Panel';

interface LetterPanelProps {
  active: boolean;
  letter: string;
}

/** Wax-sealed envelope. Tapping it types the letter out one character at a time. */
export default function LetterPanel({ active, letter }: LetterPanelProps) {
  const [opened, setOpened] = useState(false);
  const [text, setText] = useState('');
  const typing = useRef(false);
  const mounted = useRef(false);

  // Set on every mount (not just once) so React StrictMode's dev re-mount keeps working
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const openLetter = async (): Promise<void> => {
    if (typing.current) return;
    typing.current = true;
    setOpened(true);
    setText('');
    let acc = '';
    for (const ch of letter) {
      if (!mounted.current) break;
      acc += ch;
      setText(acc);
      await wait(35);
    }
    typing.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') void openLetter();
  };

  return (
    <Panel id="letter" active={active}>
      <h2>Love Letter</h2>
      <div
        id="envelope"
        className="envelope"
        role="button"
        tabIndex={0}
        hidden={opened}
        onClick={() => void openLetter()}
        onKeyDown={onKeyDown}
      >
        Tap to open
      </div>
      <p id="letterText" className="letter" hidden={!opened}>
        {text}
      </p>
    </Panel>
  );
}
