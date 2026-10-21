import { useEffect, useRef } from 'react';
import { STARTING_BALANCE } from '../utils/gameLogic.js';

/** In-page confirmation (no window.confirm) that traps focus while open. */
export default function ResetDialog({ open, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') {
        const buttons = dialogRef.current?.querySelectorAll('button') ?? [];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        aria-describedby="reset-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reset-title">Reset the demo?</h2>
        <p id="reset-desc">
          Your balance goes back to {STARTING_BALANCE.toLocaleString('en-US')} virtual credits and your spin history is
          cleared. This can’t be undone.
        </p>
        <div className="dialog-actions">
          <button id="reset-cancel" ref={cancelRef} type="button" className="ghost-button" onClick={onCancel}>
            Keep playing
          </button>
          <button id="reset-confirm" type="button" className="danger-button" onClick={onConfirm}>
            Reset demo
          </button>
        </div>
      </div>
    </div>
  );
}
