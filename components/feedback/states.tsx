import { CircleNotch, Database, Warning } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, detail, actionHref, actionLabel = "Continuar" }: { title: string; detail: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="brand-surface rounded-[1.35rem] p-8 text-center">
      <Database size={30} weight="fill" className="mx-auto mb-3 text-[color:var(--accent)]" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{detail}</p>
      {actionHref ? (
        <Button href={actionHref} tone="primary" className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[1.25rem] bg-[color:var(--danger)]/10 p-5 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--danger)]/25">
      <div className="flex gap-3">
        <Warning size={22} weight="fill" className="shrink-0 text-[color:var(--danger)]" aria-hidden />
        <div>
          <h2 className="font-black text-[color:var(--foreground)]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ label = "Cargando datos" }: { label?: string }) {
  return (
    <div className="metal-frame rounded-[1.25rem] p-6 text-sm text-[color:var(--muted)]">
      <CircleNotch weight="bold" className="mr-2 inline animate-spin text-[color:var(--accent)]" aria-hidden />
      {label}
    </div>
  );
}
