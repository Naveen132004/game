import { calculateNetResult, getResultMessage, MESSAGES } from '../utils/gameLogic.js';

function formatSigned(n) {
  if (n > 0) return `+${n.toLocaleString('en-US')}`;
  if (n < 0) return `−${Math.abs(n).toLocaleString('en-US')}`;
  return '0';
}

export default function ResultMessage({ spinning, lastResult, insufficientCredits }) {
  const { tone, text } = getResultMessage({ spinning, lastResult });
  const net = lastResult ? calculateNetResult(lastResult.bet, lastResult.totalPayout) : null;

  return (
    <div className={`result tone-${tone}`}>
      <p className="result-text" role="status" aria-live="polite" data-testid="result-message">
        {text}
      </p>
      {lastResult && !spinning && (
        <p className="result-detail num">
          <span>Payout {lastResult.totalPayout.toLocaleString('en-US')}</span>
          <span className={`net ${net > 0 ? 'is-up' : net < 0 ? 'is-down' : ''}`} data-testid="net-result">
            Net {formatSigned(net)}
          </span>
        </p>
      )}
      {insufficientCredits && (
        <p className="result-alert" role="alert">
          {MESSAGES.insufficient}
        </p>
      )}
    </div>
  );
}
