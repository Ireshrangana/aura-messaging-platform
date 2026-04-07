export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/80 px-8 py-10 text-center shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aura-500">Aura</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          This route does not exist in the current messaging workspace.
        </p>
      </div>
    </main>
  );
}
