import { Info } from "@phosphor-icons/react/dist/ssr";

export function InfoToggletip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group relative inline-block">
      <summary className="focus-ring ui-pressable inline-flex min-h-8 min-w-8 cursor-pointer list-none items-center justify-center rounded-full text-[color:var(--muted)] transition-[transform,color,background-color] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.97] group-open:bg-[color:var(--surface-soft)] group-open:text-[color:var(--accent)]">
        <Info size={15} weight="fill" aria-label={label} />
      </summary>
      <div className="info-popover brand-surface fixed left-4 right-4 top-20 z-[70] max-h-[calc(100dvh-6rem)] overflow-auto rounded-[1.1rem] p-3 text-sm leading-6 text-[color:var(--foreground)] transition-[transform,opacity] duration-160 ease-[var(--ease-out-premium)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-[min(24rem,calc(100dvh-6rem))] sm:w-72 sm:origin-top-right sm:overflow-auto">
        {children}
      </div>
    </details>
  );
}
