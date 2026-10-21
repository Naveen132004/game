import { describe, expect, it } from 'vitest';
import { gameReducer, createInitialState, isSpinning } from '../state/gameReducer.js';
import { LOSING_GRID, MIDDLE_THREE_BELLS, TOP_AND_BOTTOM_WIN } from './grids.js';

const start = (state, grid, spinId = 'spin-1') =>
  gameReducer(state, { type: 'SPIN_STARTED', grid, spinId, timestamp: 1_700_000_000_000 });
const complete = (state, spinId = 'spin-1') => gameReducer(state, { type: 'SPIN_COMPLETED', spinId });

describe('credit flow', () => {
  it('deducts the bet when a spin starts and credits nothing yet', () => {
    const state = start(createInitialState({ bet: 25 }), MIDDLE_THREE_BELLS);
    expect(state.balance).toBe(975);
    expect(isSpinning(state)).toBe(true);
    expect(state.grid).toBe(MIDDLE_THREE_BELLS);
    expect(state.pendingSpin.totalPayout).toBe(100);
  });

  it('credits the payout when the reels stop', () => {
    const state = complete(start(createInitialState({ bet: 25 }), MIDDLE_THREE_BELLS));
    expect(state.balance).toBe(975 + 100);
    expect(isSpinning(state)).toBe(false);
    expect(state.lastResult.totalPayout).toBe(100);
  });

  it('leaves only the deduction on a losing spin', () => {
    const state = complete(start(createInitialState({ bet: 50 }), LOSING_GRID));
    expect(state.balance).toBe(950);
    expect(state.history[0]).toMatchObject({ bet: 50, payout: 0, net: -50, balanceAfter: 950 });
  });

  it('refuses a spin the balance cannot cover and never goes negative', () => {
    const poor = createInitialState({ balance: 40, bet: 50 });
    expect(start(poor, LOSING_GRID)).toBe(poor);

    let state = createInitialState({ balance: 20, bet: 10 });
    for (let i = 0; i < 5; i += 1) state = complete(start(state, LOSING_GRID, `s${i}`), `s${i}`);
    expect(state.balance).toBe(0);
    expect(state.history).toHaveLength(2);
  });
});

describe('duplicate protection', () => {
  it('ignores a second spin while one is in progress', () => {
    const first = start(createInitialState(), LOSING_GRID, 'a');
    const second = start(first, TOP_AND_BOTTOM_WIN, 'b');
    expect(second).toBe(first);
    expect(second.balance).toBe(990);
  });

  it('credits a payout only once even if completion fires twice', () => {
    const once = complete(start(createInitialState({ bet: 10 }), TOP_AND_BOTTOM_WIN));
    const twice = complete(once);
    expect(twice).toBe(once);
    expect(twice.balance).toBe(990 + 100);
    expect(twice.history).toHaveLength(1);
  });

  it('ignores a completion for a different spin', () => {
    const spinning = start(createInitialState(), TOP_AND_BOTTOM_WIN, 'current');
    expect(complete(spinning, 'stale')).toBe(spinning);
  });

  it('ignores a completion left over from before a reset', () => {
    const spinning = start(createInitialState({ bet: 100 }), TOP_AND_BOTTOM_WIN, 'old');
    const reset = gameReducer(spinning, { type: 'GAME_RESET' });
    expect(reset.balance).toBe(1000);
    expect(complete(reset, 'old')).toBe(reset);
  });

  it('does not change the bet mid-spin', () => {
    const spinning = start(createInitialState(), LOSING_GRID);
    expect(gameReducer(spinning, { type: 'BET_CHANGED', bet: 100 })).toBe(spinning);
  });
});

describe('bets, history and reset', () => {
  it('accepts only the listed bet sizes', () => {
    const state = createInitialState();
    expect(gameReducer(state, { type: 'BET_CHANGED', bet: 50 }).bet).toBe(50);
    expect(gameReducer(state, { type: 'BET_CHANGED', bet: 7 })).toBe(state);
  });

  it('records each spin newest first and keeps the latest 20', () => {
    let state = createInitialState({ balance: 10_000 });
    for (let i = 1; i <= 25; i += 1) state = complete(start(state, LOSING_GRID, `s${i}`), `s${i}`);
    expect(state.history).toHaveLength(20);
    expect(state.history[0]).toMatchObject({ id: 's25', number: 25 });
    expect(state.history[19]).toMatchObject({ id: 's6', number: 6 });
  });

  it('reset restores the starting balance and clears history', () => {
    let state = complete(start(createInitialState({ bet: 100 }), LOSING_GRID));
    state = gameReducer(state, { type: 'GAME_RESET' });
    expect(state).toEqual(createInitialState());
  });
});
