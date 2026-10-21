import { RotateCcw } from 'lucide-react';
import CreditBalance from './CreditBalance.jsx';

export default function GameHeader({ balance, bet, onResetClick, resetDisabled, reducedMotion }) {
  return (
    <header className="game-header">
      <div className="brand">
        <h1>Midnight Reels</h1>
        <p className="tagline">Slot machine simulator · virtual credits only</p>
      </div>
      <div className="header-readouts">
        <CreditBalance balance={balance} reducedMotion={reducedMotion} />
        <div className="readout">
          <span className="readout-label">Bet</span>
          <span className="readout-value num" data-testid="current-bet">{bet}</span>
        </div>
        <button id="reset-demo" type="button" className="ghost-button" onClick={onResetClick} disabled={resetDisabled}>
          <RotateCcw size={16} aria-hidden="true" /> Reset Demo
        </button>
      </div>
    </header>
  );
}
