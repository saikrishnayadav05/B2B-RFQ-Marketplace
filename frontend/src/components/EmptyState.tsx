export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-panel border-dashed px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
        ✦
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
    </div>
  );
}
