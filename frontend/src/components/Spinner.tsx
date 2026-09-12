export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-indigo-400" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
