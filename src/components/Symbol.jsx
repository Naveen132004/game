import { memo } from 'react';
import { SYMBOLS } from '../utils/paytable.js';

/**
 * Hand-drawn SVG symbols (no third-party art). Gradients live once in <SymbolDefs />
 * and are shared by every symbol on the page.
 */
const ART = {
  CHERRY: (
    <>
      <path d="M33 10c-4 8-11 16-16 26M33 10c3 9 6 17 13 25" stroke="#3f8f3a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M33 10c6-4 14-4 18 1-6 3-12 3-18-1z" fill="#58b84c" />
      <circle cx="18" cy="43" r="12" fill="url(#g-cherry)" />
      <circle cx="45" cy="42" r="12" fill="url(#g-cherry)" />
      <ellipse cx="14" cy="38" rx="3" ry="4.5" fill="#fff" opacity=".55" />
      <ellipse cx="41" cy="37" rx="3" ry="4.5" fill="#fff" opacity=".55" />
    </>
  ),
  LEMON: (
    <>
      <path d="M8 33c0-12 11-21 24-21s24 9 24 21-11 21-24 21S8 45 8 33z" fill="url(#g-lemon)" />
      <path d="M8 33l-4-2 4-3M56 33l4-2-4-3" fill="#e0b400" />
      <ellipse cx="24" cy="24" rx="7" ry="3.5" fill="#fff" opacity=".5" transform="rotate(-20 24 24)" />
    </>
  ),
  GRAPES: (
    <>
      <path d="M32 6v9" stroke="#6b4a2b" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M33 12c6-6 15-6 19-1-6 4-13 4-19 1z" fill="#58b84c" />
      {[[22, 22], [34, 20], [46, 22], [16, 34], [28, 32], [40, 32], [52, 34], [22, 44], [34, 44], [46, 44], [28, 55], [40, 55]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="7.2" fill="url(#g-grape)" />
          <circle cx={cx - 2.3} cy={cy - 2.3} r="1.8" fill="#fff" opacity=".5" />
        </g>
      ))}
    </>
  ),
  BELL: (
    <>
      <path d="M32 7c-11 0-17 9-17 20v10l-6 9h46l-6-9V27c0-11-6-20-17-20z" fill="url(#g-gold)" stroke="#8a5a00" strokeWidth="2" />
      <rect x="28" y="3" width="8" height="6" rx="3" fill="#c98a0b" />
      <circle cx="32" cy="52" r="6" fill="#c98a0b" stroke="#8a5a00" strokeWidth="2" />
      <path d="M22 26c0-6 3-10 7-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
    </>
  ),
  STAR: (
    <>
      <path d="M32 5l8.2 17 18.6 2.3-13.7 12.8 3.6 18.5L32 46.4 15.3 55.6l3.6-18.5L5.2 24.3 23.8 22z" fill="url(#g-star)" stroke="#b86e00" strokeWidth="2" strokeLinejoin="round" />
      <path d="M26 24l6-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" />
    </>
  ),
  DIAMOND: (
    <>
      <path d="M14 10h36l11 15-29 33L3 25z" fill="url(#g-diamond)" stroke="#1b6fa8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 25h58M14 10l8 15 10-15 10 15 8-15M22 25l10 33 10-33" stroke="#e8fbff" strokeWidth="1.6" fill="none" opacity=".8" strokeLinejoin="round" />
    </>
  ),
  SEVEN: (
    <>
      <path d="M12 9h42v9L33 57H19l20-36H12z" fill="url(#g-seven)" stroke="#ffd166" strokeWidth="3" strokeLinejoin="round" />
      <path d="M17 13h30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
    </>
  ),
};

export function SymbolDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="g-cherry" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#ff6b81" /><stop offset="1" stopColor="#b3001b" /></radialGradient>
        <radialGradient id="g-lemon" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#fff4a3" /><stop offset="1" stopColor="#f2c200" /></radialGradient>
        <radialGradient id="g-grape" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#c58cff" /><stop offset="1" stopColor="#5b1a9e" /></radialGradient>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0a8" /><stop offset=".5" stopColor="#ffc93c" /><stop offset="1" stopColor="#d18a00" /></linearGradient>
        <linearGradient id="g-star" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset="1" stopColor="#ff9f1c" /></linearGradient>
        <linearGradient id="g-diamond" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b8f3ff" /><stop offset=".55" stopColor="#4cc9f0" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
        <linearGradient id="g-seven" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5d73" /><stop offset="1" stopColor="#c1121f" /></linearGradient>
      </defs>
    </svg>
  );
}

function Symbol({ id, winning = false, size }) {
  const symbol = SYMBOLS[id];
  return (
    <span className={`symbol symbol-${id.toLowerCase()}${winning ? ' is-winning' : ''}`} style={size ? { '--symbol-size': size } : undefined}>
      <svg viewBox="0 0 64 64" role="img" aria-label={symbol.label}>
        {ART[id]}
      </svg>
    </span>
  );
}

export default memo(Symbol);
