import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App.jsx';
import { STORAGE_KEY } from '../utils/storage.js';
import { LOSING_GRID, MIDDLE_THREE_BELLS, TOP_AND_BOTTOM_WIN } from './grids.js';

// Longest reel animation plus settle delay; advancing past it lands the payout.
const FULL_SPIN_MS = 3000;

function renderWithGrids(...grids) {
  const queue = [...grids];
  const generateGrid = vi.fn(() => queue.shift() ?? LOSING_GRID);
  const utils = render(<App generateGrid={generateGrid} />);
  return { ...utils, generateGrid };
}

const spinButton = () => screen.getByRole('button', { name: /spin/i });
const message = () => screen.getByTestId('result-message');
const balanceText = () => screen.getByText(/virtual credits$/, { selector: '.sr-only' }).textContent;

function finishSpin() {
  act(() => vi.advanceTimersByTime(FULL_SPIN_MS));
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('App', () => {
  it('shows a win message, payout and net after a winning spin', () => {
    renderWithGrids(MIDDLE_THREE_BELLS);
    fireEvent.click(spinButton());
    expect(message()).toHaveTextContent('Reels spinning…');
    expect(balanceText()).toBe('990 virtual credits');
    finishSpin();
    expect(message()).toHaveTextContent('You won 40 virtual credits!');
    expect(screen.getByTestId('net-result')).toHaveTextContent('Net +30');
    expect(balanceText()).toBe('1,030 virtual credits');
  });

  it('shows the big-win message when several lines pay', () => {
    renderWithGrids(TOP_AND_BOTTOM_WIN);
    fireEvent.click(spinButton());
    finishSpin();
    expect(message()).toHaveTextContent('Big win! 100 virtual credits!');
  });

  it('shows the loss message after a losing spin', () => {
    renderWithGrids(LOSING_GRID);
    fireEvent.click(spinButton());
    finishSpin();
    expect(message()).toHaveTextContent('No win this time. Try another spin!');
    expect(screen.getByTestId('net-result')).toHaveTextContent('Net −10');
  });

  it('blocks extra spins while the reels are moving', () => {
    const { generateGrid } = renderWithGrids(MIDDLE_THREE_BELLS);
    fireEvent.click(spinButton());
    expect(spinButton()).toBeDisabled();
    fireEvent.click(spinButton());
    fireEvent.keyDown(window, { code: 'Space' });
    expect(generateGrid).toHaveBeenCalledTimes(1);
    finishSpin();
    finishSpin();
    expect(balanceText()).toBe('1,030 virtual credits');
    expect(screen.getByTestId('history-list').children).toHaveLength(1);
  });

  it('changes the bet and uses it for the payout', () => {
    renderWithGrids(MIDDLE_THREE_BELLS);
    fireEvent.click(screen.getByLabelText('100'));
    expect(screen.getByTestId('current-bet')).toHaveTextContent('100');
    fireEvent.click(spinButton());
    finishSpin();
    expect(message()).toHaveTextContent('You won 400 virtual credits!');
    expect(balanceText()).toBe('1,300 virtual credits');
  });

  it('warns and disables Spin when credits do not cover the bet', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance: 30, bet: 50 }));
    renderWithGrids();
    expect(screen.getByRole('alert')).toHaveTextContent('Not enough credits for this bet.');
    expect(spinButton()).toBeDisabled();
    fireEvent.click(screen.getByLabelText('25'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(spinButton()).toBeEnabled();
  });

  it('keeps balance and history after a reload', () => {
    const first = renderWithGrids(MIDDLE_THREE_BELLS);
    fireEvent.click(spinButton());
    finishSpin();
    first.unmount();

    renderWithGrids();
    expect(balanceText()).toBe('1,030 virtual credits');
    const rows = within(screen.getByTestId('history-list')).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('#1');
  });

  it('resets only after confirmation, and a spin in flight cannot pay into the new game', () => {
    renderWithGrids(LOSING_GRID, TOP_AND_BOTTOM_WIN);
    fireEvent.click(spinButton());
    finishSpin();
    expect(balanceText()).toBe('990 virtual credits');

    fireEvent.click(screen.getByRole('button', { name: /reset demo/i }));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /keep playing/i }));
    expect(balanceText()).toBe('990 virtual credits');

    fireEvent.click(screen.getByRole('button', { name: /reset demo/i }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /^reset demo$/i }));
    expect(balanceText()).toBe('1,000 virtual credits');
    expect(screen.getByText('No spins yet.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toMatchObject({ balance: 1000, history: [] });
  });

  it('never saves a half-finished spin when the page closes mid-spin', () => {
    const { rerender } = renderWithGrids(TOP_AND_BOTTOM_WIN);
    fireEvent.click(spinButton());
    // Reset Demo is disabled mid-spin; unmounting simulates closing the tab mid-spin.
    expect(screen.getByRole('button', { name: /reset demo/i })).toBeDisabled();
    rerender(<div />);
    finishSpin();
    // The unsettled spin was never saved, so the next visit starts from the pre-spin state.
    render(<App generateGrid={() => LOSING_GRID} />);
    expect(balanceText()).toBe('1,000 virtual credits');
  });

  it('spins with the space bar', () => {
    const { generateGrid } = renderWithGrids(MIDDLE_THREE_BELLS);
    fireEvent.keyDown(document.body, { code: 'Space' });
    expect(generateGrid).toHaveBeenCalledTimes(1);
  });
});
