export default function DashboardLoading() {
  return (
    <main className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 h-10 w-56 skeleton rounded-lg bg-[color:var(--surface-soft)]" />
      <section className="brand-surface mb-6 rounded-lg p-6">
        <div className="h-8 w-64 skeleton rounded-lg bg-[color:var(--surface-soft)]" />
        <div className="mt-4 h-4 w-full max-w-xl skeleton rounded bg-[color:var(--surface-soft)]" />
        <div className="mt-2 h-4 w-2/3 skeleton rounded bg-[color:var(--surface-soft)]" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 skeleton rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)]" />
          ))}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-20 skeleton rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)]" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-14 skeleton rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)]" />
          ))}
        </div>
      </div>
    </main>
  );
}
