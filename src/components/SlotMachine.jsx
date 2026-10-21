import Reel from './Reel.jsx';
import PaylineOverlay from './PaylineOverlay.jsx';
import Celebration from './Celebration.jsx';
import { PAYLINES, REEL_COUNT, getPaylineById } from '../utils/paylines.js';

export default function SlotMachine({
  grid,
  spinning,
  spinKey,
  reelDurations,
  wins,
  previewLineId,
  largeWin,
  reducedMotion,
}) {
  // grid is grid[row][reel]; each reel component wants its own column.
  const columns = Array.from({ length: REEL_COUNT }, (_, reel) => grid.map((row) => row[reel]));

  const winningRowsByReel = Array.from({ length: REEL_COUNT }, () => new Set());
  if (!spinning) {
    wins.forEach((win) => win.positions.forEach(([row, reel]) => winningRowsByReel[reel].add(row)));
  }

  const winLines = spinning ? [] : wins.map((win) => getPaylineById(win.paylineId));
  const previewLine = previewLineId != null && !spinning ? getPaylineById(previewLineId) : null;

  return (
    <div className={`machine${largeWin && !spinning ? ' is-celebrating' : ''}`}>
      <ol className="line-tabs" aria-hidden="true">
        {PAYLINES.map((line) => (
          <li
            key={line.id}
            className={winLines.some((l) => l.id === line.id) ? 'is-hit' : ''}
            style={{
              '--line-color': line.color,
              '--row': line.rows[0],
              '--stack': PAYLINES.filter((l) => l.rows[0] === line.rows[0] && l.id < line.id).length,
            }}
          >
            {line.id}
          </li>
        ))}
      </ol>
      <div className="reel-window">
        <div className="reels">
          {columns.map((symbols, reel) => (
            <Reel
              key={reel}
              reelIndex={reel}
              symbols={symbols}
              spinning={spinning}
              spinKey={spinKey}
              duration={reelDurations[reel]}
              winningRows={winningRowsByReel[reel]}
            />
          ))}
        </div>
        {previewLine ? (
          <PaylineOverlay lines={[previewLine]} variant="preview" />
        ) : (
          <PaylineOverlay lines={winLines} variant="win" key={`win-${spinKey}`} />
        )}
        {!reducedMotion && largeWin && !spinning && <Celebration burstKey={spinKey} />}
      </div>
    </div>
  );
}
