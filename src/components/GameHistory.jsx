import { History } from 'lucide-react';
import Symbol from './Symbol.jsx';
import { SYMBOLS } from '../utils/paytable.js';
import { getPaylineById } from '../utils/paylines.js';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

function signed(n) {
  if (n > 0) return `+${n.toLocaleString('en-US')}`;
  if (n < 0) return `−${Math.abs(n).toLocaleString('en-US')}`;
  return '0';
}

function SpinReview({ entry }) {
  const winningCells = new Set();
  entry.winningPaylines.forEach((win) => {
    const line = getPaylineById(win.paylineId);
    line?.rows.slice(0, win.matchCount).forEach((row, reel) => winningCells.add(`${row}-${reel}`));
  });
  return (
    <div className="review">
      <div className="review-grid" role="img" aria-label="Reel result for this spin">
        {entry.grid.map((row, r) =>
          row.map((id, reel) => (
            <span key={`${r}-${reel}`} className={winningCells.has(`${r}-${reel}`) ? 'is-hit' : ''}>
              <Symbol id={id} size="100%" />
            </span>
          )),
        )}
      </div>
      <div className="review-meta">
        <p className="muted">{timeFormat.format(entry.timestamp)}</p>
        {entry.winningPaylines.length === 0 ? (
          <p className="muted">No winning paylines.</p>
        ) : (
          <ul className="review-wins">
            {entry.winningPaylines.map((win) => {
              const line = getPaylineById(win.paylineId);
              return (
                <li key={win.paylineId} style={{ '--line-color': line?.color }}>
                  Line {win.paylineId}: {win.matchCount} × {SYMBOLS[win.symbol].label}
                  <span className="num"> +{win.payout.toLocaleString('en-US')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function GameHistory({ history }) {
  return (
    <section className="panel history" aria-labelledby="history-title">
      <h2 id="history-title">
        <History size={18} aria-hidden="true" /> Recent spins
        <span className="count num">{history.length}</span>
      </h2>
      {history.length === 0 ? (
        <div className="empty">
          <p>No spins yet.</p>
          <p className="muted">Each spin is recorded here with its bet, reels, winning lines, payout and balance. Open one to review it.</p>
        </div>
      ) : (
        <>
          <div className="history-head" aria-hidden="true">
            <span>Spin</span>
            <span>Bet</span>
            <span>Payout</span>
            <span>Net</span>
            <span>Balance</span>
          </div>
          <ol className="history-list" data-testid="history-list">
            {history.map((entry) => {
              const outcome = entry.payout > 0 ? 'win' : 'loss';
              return (
                <li key={entry.id} className={`is-${outcome}`}>
                  <details>
                    <summary aria-label={`Spin ${entry.number}: bet ${entry.bet}, payout ${entry.payout}, net ${entry.net}, balance ${entry.balanceAfter}`}>
                      <span className="h-spin num">
                        <span className={`badge badge-${outcome}`}>{outcome === 'win' ? 'Win' : 'Loss'}</span>#{entry.number}
                      </span>
                      <span className="num">{entry.bet}</span>
                      <span className="num">{entry.payout.toLocaleString('en-US')}</span>
                      <span className={`num net ${entry.net > 0 ? 'is-up' : 'is-down'}`}>{signed(entry.net)}</span>
                      <span className="num">{entry.balanceAfter.toLocaleString('en-US')}</span>
                    </summary>
                    <SpinReview entry={entry} />
                  </details>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
