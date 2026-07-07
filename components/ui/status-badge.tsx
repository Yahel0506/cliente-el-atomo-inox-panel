import { cn } from "@/lib/utils";

const tones = {
  active: "border-[color:var(--success)]/50 bg-[color:var(--success)]/15 text-[color:var(--success)]",
  hidden: "border-[color:var(--border)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]",
  warning: "border-[color:var(--accent)]/55 bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  danger: "border-[color:var(--danger)]/55 bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  info: "border-[color:var(--info)]/55 bg-[color:var(--info)]/15 text-[color:var(--info)]",
};

export function StatusBadge({
  children,
  tone = "hidden",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,color,border-color,opacity,transform] duration-180 ease-[var(--ease-out-premium)]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
