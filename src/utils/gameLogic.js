import { PAYTABLE, MIN_MATCH, getMultiplier } from './paytable.js';
import { PAYLINES } from './paylines.js';

export const STARTING_BALANCE = 1000;
export const BET_OPTIONS = [10, 25, 50, 100];
export const HISTORY_LIMIT = 20;

/** Symbols a payline passes through, left to right. */
export function getPaylineSymbols(grid, payline) {
  return payline.rows.map((row, reel) => grid[row][reel]);
}

/**
 * Evaluates one payline on its own.
 *
 * Matching starts on the leftmost reel and stops at the first different symbol, so
 * [A, A, A, B, A] is a run of 3. Only the full run is paid: a run of 5 pays the
 * 5-match multiplier once, never the 3- and 4-match amounts as well.
 *
 * Returns null when the run is shorter than MIN_MATCH, otherwise
 * { paylineId, symbol, matchCount, multiplier, positions } where positions are the
 * [row, reel] cells that form the run.
 */
export function evaluatePayline(grid, payline, paytable = PAYTABLE) {
  const symbols = getPaylineSymbols(grid, payline);
  const symbol = symbols[0];
  let matchCount = 1;
  while (matchCount < symbols.length && symbols[matchCount] === symbol) matchCount += 1;

  if (matchCount < MIN_MATCH) return null;
  const multiplier = getMultiplier(symbol, matchCount, paytable);
  if (multiplier === 0) return null;

  return {
    paylineId: payline.id,
    symbol,
    matchCount,
    multiplier,
    positions: payline.rows.slice(0, matchCount).map((row, reel) => [row, reel]),
  };
}

/** Every payline that wins on this grid, each evaluated independently. */
export function getWinningPaylines(grid, paylines = PAYLINES, paytable = PAYTABLE) {
  return paylines.map((line) => evaluatePayline(grid, line, paytable)).filter(Boolean);
}

/**
 * Payout formula:
 *
 *   payout = Σ over winning paylines of (bet × multiplier[symbol][matchCount])
 *
 * The bet is the amount staked on the spin; each payline pays independently and
 * the line payouts are added together.
 *
 * Returns { totalPayout, wins } where each win also carries its own `payout`.
 */
export function calculatePayout(grid, bet, paylines = PAYLINES, paytable = PAYTABLE) {
  const wins = getWinningPaylines(grid, paylines, paytable).map((win) => ({
    ...win,
    payout: bet * win.multiplier,
  }));
  const totalPayout = wins.reduce((sum, win) => sum + win.payout, 0);
  return { totalPayout, wins };
}

/** Credits gained (positive) or lost (negative) on a spin. */
export function calculateNetResult(bet, payout) {
  return payout - bet;
}

export function canAffordBet(balance, bet) {
  return Number.isFinite(balance) && balance >= bet && bet > 0;
}

/** A completed spin, as stored in game history. */
export function createHistoryEntry({ id, number, timestamp, bet, grid, wins, totalPayout, balanceAfter }) {
  return {
    id,
    number,
    timestamp,
    bet,
    grid: grid.map((row) => [...row]),
    winningPaylines: wins.map(({ paylineId, symbol, matchCount, payout }) => ({
      paylineId,
      symbol,
      matchCount,
      payout,
    })),
    payout: totalPayout,
    net: calculateNetResult(bet, totalPayout),
    balanceAfter,
  };
}

export const MESSAGES = {
  welcome: 'Pick a bet and press Spin.',
  spinning: 'Reels spinning…',
  noWin: 'No win this time. Try another spin!',
  insufficient: 'Not enough credits for this bet.',
  singleWin: (amount) => `You won ${amount.toLocaleString('en-US')} virtual credits!`,
  multiWin: (amount) => `Big win! ${amount.toLocaleString('en-US')} virtual credits!`,
};

/** Status line for the current game state. */
export function getResultMessage({ spinning, lastResult }) {
  if (spinning) return { tone: 'spinning', text: MESSAGES.spinning };
  if (!lastResult) return { tone: 'idle', text: MESSAGES.welcome };
  if (lastResult.wins.length === 0) return { tone: 'loss', text: MESSAGES.noWin };
  if (lastResult.wins.length === 1) return { tone: 'win', text: MESSAGES.singleWin(lastResult.totalPayout) };
  return { tone: 'big', text: MESSAGES.multiWin(lastResult.totalPayout) };
}

/** Large wins get particles and a cabinet flash: several lines, or 10× the bet or more. */
export function isLargeWin(result) {
  return Boolean(result) && (result.wins.length > 1 || result.totalPayout >= result.bet * 10);
}
