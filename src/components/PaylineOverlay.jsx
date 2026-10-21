import { REEL_COUNT, ROW_COUNT } from '../utils/paylines.js';

/**
 * Draws paylines over the reels. The viewBox uses one unit per cell, so a line
 * through cell (row, reel) passes the point (reel + 0.5, row + 0.5) and scales with
 * the grid at any screen size.
 */
export default function PaylineOverlay({ lines, variant = 'win' }) {
  if (lines.length === 0) return null;
  return (
    <svg
      className={`payline-overlay is-${variant}`}
      viewBox={`0 0 ${REEL_COUNT} ${ROW_COUNT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {lines.map((line) => {
        const points = line.rows.map((row, reel) => `${reel + 0.5},${row + 0.5}`).join(' ');
        return (
          <g key={line.id} style={{ '--line-color': line.color }}>
            <polyline className="payline-glow" points={points} vectorEffect="non-scaling-stroke" />
            <polyline className="payline-stroke" points={points} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
}
