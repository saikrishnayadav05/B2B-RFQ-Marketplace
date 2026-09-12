import { useRef, type InputHTMLAttributes } from 'react';

interface DateTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

export function DateTimeInput({ label, error, id, className = '', ...props }: DateTimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="datetime-local"
          className={`datetime-input w-full rounded-xl border bg-slate-950/40 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10 ${
            error ? 'border-rose-400/70' : 'border-white/10'
          } ${className}`}
          onClick={openPicker}
          {...props}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-200"
          aria-label="Open calendar"
        >
          <CalendarIcon />
        </button>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
