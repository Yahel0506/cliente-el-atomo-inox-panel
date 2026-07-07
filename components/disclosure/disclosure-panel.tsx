import { CaretDown } from "@phosphor-icons/react/dist/ssr";

export function DisclosurePanel({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="motion-disclosure group rounded-[1.25rem] bg-[color:var(--panel)] shadow-[var(--shadow-card)] transition-[background-color,box-shadow] duration-180 ease-[var(--ease-out-premium)] open:bg-[color:var(--panel-raised)] open:shadow-[var(--shadow-soft)]"
    >
      <summary className="focus-ring ui-pressable flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]">
        <span>{title}</span>
        <CaretDown className="shrink-0 text-[color:var(--muted)] transition-transform duration-180 ease-[var(--ease-out-premium)] group-open:rotate-180" size={18} weight="fill" aria-hidden />
      </summary>
      <div className="border-t border-[color:var(--border)]/35 px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">{children}</div>
    </details>
  );
}
