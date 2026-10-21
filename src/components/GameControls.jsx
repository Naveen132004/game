import { BET_OPTIONS } from '../utils/gameLogic.js';

export default function GameControls({ bet, balance, onBetChange, onSpin, canSpin, spinning }) {
  return (
    <div className="controls">
      <fieldset className="bet-picker" disabled={spinning}>
        <legend>Bet per spin</legend>
        <div className="bet-options">
          {BET_OPTIONS.map((option) => (
            <label key={option} className={`bet-chip${option > balance ? ' is-unaffordable' : ''}`}>
              <input
                id={`bet-${option}`}
                type="radio"
                name="bet"
                value={option}
                checked={bet === option}
                onChange={() => onBetChange(option)}
              />
              <span className="num">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        id="spin"
        type="button"
        className={`spin-button${spinning ? ' is-spinning' : ''}`}
        onClick={onSpin}
        disabled={!canSpin}
        aria-describedby="spin-hint"
      >
        <span className="spin-label">{spinning ? 'Spinning' : 'Spin'}</span>
        <span className="spin-sub num">{bet} credits</span>
      </button>
      <p id="spin-hint" className="sr-only">Press the space bar to spin.</p>
    </div>
  );
}
