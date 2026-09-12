import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, className = '', ...props }: TextAreaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`min-h-32 w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10 ${
          error ? 'border-rose-400/70' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
