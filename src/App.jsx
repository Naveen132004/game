import { useCallback, useEffect, useMemo, useState } from 'react';
import GameHeader from './components/GameHeader.jsx';
import SlotMachine from './components/SlotMachine.jsx';
import GameControls from './components/GameControls.jsx';
import ResultMessage from './components/ResultMessage.jsx';
import Paytable from './components/Paytable.jsx';
import GameHistory from './components/GameHistory.jsx';
import ResetDialog from './components/ResetDialog.jsx';
import { SymbolDefs } from './components/Symbol.jsx';
import { useGameState } from './hooks/useGameState.js';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
import { BET_OPTIONS, isLargeWin } from './utils/gameLogic.js';
import { REEL_COUNT } from './utils/paylines.js';
import { generateSpinResult } from './utils/randomSymbols.js';
import './App.css';

// Reel i stops after base + i × stagger ms; the payout is credited after the last one.
const REEL_TIMING = { base: 950, stagger: 260 };
const REDUCED_REEL_TIMING = { base: 300, stagger: 90 };
const SETTLE_DELAY_MS = 80;

export default function App({ generateGrid = generateSpinResult }) {
  const reducedMotion = usePrefersReducedMotion();
  const reelDurations = useMemo(() => {
    const { base, stagger } = reducedMotion ? REDUCED_REEL_TIMING : REEL_TIMING;
    return Array.from({ length: REEL_COUNT }, (_, i) => base + i * stagger);
  }, [reducedMotion]);
  const spinDuration = reelDurations[REEL_COUNT - 1] + SETTLE_DELAY_MS;

  const { state, spinning, canSpin, insufficientCredits, spin, setBet, reset } = useGameState({
    spinDuration,
    generateGrid,
  });
  const [resetOpen, setResetOpen] = useState(false);
  const [previewLineId, setPreviewLineId] = useState(null);

  const handleSpin = useCallback(() => {
    setPreviewLineId(null);
    spin();
  }, [spin]);

  // Space bar spins unless a control (which uses Space itself) has focus.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.repeat || resetOpen) return;
      const target = e.target;
      if (target instanceof Element && target.closest('button, input, summary, a, select, textarea')) return;
      e.preventDefault();
      handleSpin();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSpin, resetOpen]);

  const closeReset = useCallback(() => setResetOpen(false), []);
  const confirmReset = useCallback(() => {
    reset();
    setResetOpen(false);
  }, [reset]);

  const lastResult = state.lastResult;
  const largeWin = isLargeWin(lastResult);
  const outOfCredits = !spinning && state.balance < BET_OPTIONS[0];

  return (
    <div className="app">
      <SymbolDefs />
      <GameHeader
        balance={state.balance}
        bet={state.bet}
        onResetClick={() => setResetOpen(true)}
        resetDisabled={spinning}
        reducedMotion={reducedMotion}
      />

      <main className="layout">
        <section className="cabinet" aria-label="Slot machine">
          <div className="cabinet-lights" aria-hidden="true" />
          <SlotMachine
            grid={state.grid}
            spinning={spinning}
            spinKey={state.pendingSpin?.id ?? lastResult?.spinId ?? 'initial'}
            reelDurations={reelDurations}
            wins={lastResult?.wins ?? []}
            previewLineId={previewLineId}
            largeWin={largeWin}
            reducedMotion={reducedMotion}
          />
          <ResultMessage spinning={spinning} lastResult={lastResult} insufficientCredits={insufficientCredits} />
          {outOfCredits && (
            <p className="out-of-credits">
              You’re out of credits. Use <strong>Reset Demo</strong> to start again with 1,000.
            </p>
          )}
          <GameControls
            bet={state.bet}
            balance={state.balance}
            onBetChange={setBet}
            onSpin={handleSpin}
            canSpin={canSpin}
            spinning={spinning}
          />
        </section>

        <Paytable bet={state.bet} onPreviewLine={setPreviewLineId} />
        <GameHistory history={state.history} />
      </main>

      <footer className="footer">
        <p>
          All credits are fictional. They can’t be bought, transferred or redeemed, and no real money is involved.
          The paytable is a demo rule set, not a model of any real game’s odds.
        </p>
      </footer>

      <ResetDialog open={resetOpen} onConfirm={confirmReset} onCancel={closeReset} />
    </div>
  );
}
