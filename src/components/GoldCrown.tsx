// src/components/GoldCrown.tsx
import { useId, type SVGProps } from 'react';

/**
 * A colored (gold) crown. Its size follows the surrounding text (1em),
 * so it scales with the font-size of whatever contains it.
 * The gradient id comes from useId so several crowns on one page never clash.
 */
export default function GoldCrown(props: SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 64 64" width="1em" height="1em" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.35" stopColor="#f2d98a" />
          <stop offset="0.7" stopColor="#d9b45a" />
          <stop offset="1" stopColor="#a8832f" />
        </linearGradient>
      </defs>
      <g stroke="#7a5a14" strokeWidth="2" strokeLinejoin="round" fill={`url(#${id})`}>
        <path d="M6 46 L4 18 L20 30 L32 10 L44 30 L60 18 L58 46 Z" />
        <rect x="6" y="46" width="52" height="9" rx="2" />
        <circle cx="4" cy="18" r="3.5" />
        <circle cx="32" cy="10" r="3.5" />
        <circle cx="60" cy="18" r="3.5" />
      </g>
      <circle cx="32" cy="50.5" r="2" fill="#d3243f" stroke="#7a5a14" strokeWidth="1" />
    </svg>
  );
}