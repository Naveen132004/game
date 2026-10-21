import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { gameReducer, createInitialState, isSpinning } from '../state/gameReducer.js';
import { canAffordBet } from '../utils/gameLogic.js';
import { generateSpinResult } from '../utils/randomSymbols.js';
import { STORAGE_KEY, sanitizeSavedGame, serializeGame } from '../utils/storage.js';
import { readStorage, useLocalStorage } from './useLocalStorage.js';

let spinSequence = 0;
function createSpinId() {
  spinSequence += 1;
  return `${Date.now().toString(36)}-${spinSequence.toString(36)}`;
}

function loadInitialState() {
  return createInitialState(sanitizeSavedGame(readStorage(STORAGE_KEY)));
}

/**
 * Owns the game state, the spin timer, and persistence.
 *
 * @param spinDuration  ms until the last reel stops; the payout is credited then.
 * @param generateGrid  source of new grids (injectable so tests can force results).
 */
export function useGameState({ spinDuration, generateGrid = generateSpinResult }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
  const spinning = isSpinning(state);
  const pendingId = state.pendingSpin?.id ?? null;

  // Read the latest state inside callbacks without re-creating them each render.
  const stateRef = useRef(state);
  stateRef.current = state;

  const spin = useCallback(() => {
    const current = stateRef.current;
    if (isSpinning(current) || !canAffordBet(current.balance, current.bet)) return false;
    dispatch({ type: 'SPIN_STARTED', grid: generateGrid(), spinId: createSpinId(), timestamp: Date.now() });
    return true;
  }, [generateGrid]);

  // Credit the payout when the reels stop. The cleanup cancels the timer on reset
  // or unmount; the reducer also ignores any completion for a spin that isn't pending.
  useEffect(() => {
    if (!pendingId) return undefined;
    const timer = setTimeout(() => dispatch({ type: 'SPIN_COMPLETED', spinId: pendingId }), spinDuration);
    return () => clearTimeout(timer);
  }, [pendingId, spinDuration]);

  const setBet = useCallback((bet) => dispatch({ type: 'BET_CHANGED', bet }), []);
  const reset = useCallback(() => dispatch({ type: 'GAME_RESET' }), []);

  // Save only between spins, so a refresh mid-spin never keeps a half-finished spin.
  const saved = useMemo(() => serializeGame(state), [state]);
  useLocalStorage(STORAGE_KEY, saved, !spinning);

  return {
    state,
    spinning,
    canSpin: !spinning && canAffordBet(state.balance, state.bet),
    insufficientCredits: !spinning && !canAffordBet(state.balance, state.bet),
    spin,
    setBet,
    reset,
  };
}
