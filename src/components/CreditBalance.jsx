import { Coins } from 'lucide-react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber.js';

export default function CreditBalance({ balance, reducedMotion }) {
  const shown = useAnimatedNumber(balance, { duration: 700, disabled: reducedMotion });
  return (
    <div className="readout readout-balance">
      <span className="readout-label">
        <Coins size={14} aria-hidden="true" /> Credits
      </span>
      <span className="readout-value num" data-testid="balance" aria-hidden="true">
        {shown.toLocaleString('en-US')}
      </span>
      {/* Screen readers get the settled value, not every counting frame. */}
      <span className="sr-only">{balance.toLocaleString('en-US')} virtual credits</span>
    </div>
  );
}
