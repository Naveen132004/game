import { useEffect, useMemo, useRef } from 'react';
import Symbol from './Symbol.jsx';
import { pickWeightedSymbol } from '../utils/randomSymbols.js';

const FILLER_BASE = 14;
const FILLER_PER_REEL = 4;

/**
 * One reel. At rest it shows its three symbols. During a spin it renders a strip
 *
 *   [final symbols, random filler…, previous symbols]
 *
 * starting scrolled to the previous symbols and sliding down until the final
 * symbols (the real, already-evaluated result) sit in the window. Later reels get
 * a longer strip and a longer duration, so they stop one after another.
 */
export default function Reel({ reelIndex, symbols, spinning, spinKey, duration, winningRows }) {
  const previousSymbols = useRef(symbols);

  useEffect(() => {
    if (!spinning) previousSymbols.current = symbols;
  }, [spinning, symbols]);

  const strip = useMemo(() => {
    if (!spinning) return null;
    const filler = Array.from({ length: FILLER_BASE + reelIndex * FILLER_PER_REEL }, () => pickWeightedSymbol());
    return [...symbols, ...filler, ...previousSymbols.current];
    // A new strip is built only when a new spin starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, spinning]);

  if (strip) {
    return (
      <div className="reel" data-testid="reel">
        <div
          key={spinKey}
          className="reel-strip is-spinning"
          style={{ '--travel': strip.length - symbols.length, animationDuration: `${duration}ms` }}
          aria-hidden="true"
        >
          {strip.map((id, i) => (
            <div className="cell" key={i}>
              <Symbol id={id} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="reel" data-testid="reel">
      <div className="reel-strip">
        {symbols.map((id, row) => (
          <div className="cell" key={row}>
            <Symbol id={id} winning={winningRows.has(row)} />
          </div>
        ))}
      </div>
    </div>
  );
}
