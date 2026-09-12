import { useEffect } from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) {
        onCancel();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="glass-panel-strong relative w-full max-w-md overflow-hidden border border-white/15 p-0 shadow-2xl shadow-black/40"
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-transparent to-sky-500/10 px-6 py-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h2 id="confirm-modal-title" className="text-xl font-semibold text-white">
            {title}
          </h2>
        </div>

        <div className="space-y-6 px-6 py-5">
          <p className="text-sm leading-6 text-slate-300">{description}</p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={loading} className="sm:min-w-[110px]">
              {cancelLabel}
            </Button>
            <Button variant={variant} onClick={onConfirm} loading={loading} className="sm:min-w-[110px]">
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
