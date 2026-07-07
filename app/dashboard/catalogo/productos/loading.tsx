export default function ProductsLoading() {
  return (
    <div className="page-enter">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-48 skeleton rounded-lg bg-[color:var(--surface-soft)]" />
        <div className="h-11 w-36 skeleton rounded-lg bg-[color:var(--accent)]/30" />
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 skeleton rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)]" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)]">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-20 skeleton border-b border-[color:var(--border)] bg-[color:var(--panel-raised)]/50" />
        ))}
      </div>
    </div>
  );
}
