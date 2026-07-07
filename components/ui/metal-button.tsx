import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "chrome" | "blue" | "green" | "dark" | "danger";

type MetalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  tone?: Tone;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const toneClass: Record<Tone, string> = {
  chrome: "border-transparent bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]",
  blue: "border-transparent bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]",
  green: "border-transparent bg-[color:var(--success)] text-black shadow-[var(--shadow-control)]",
  dark: "border-transparent bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-[var(--shadow-control)]",
  danger: "border-transparent bg-[color:var(--danger)] text-white shadow-[var(--shadow-control)]",
};

export function MetalButton({ href, tone = "chrome", iconLeft, iconRight, className, children, ...props }: MetalButtonProps) {
  const classes = cn(
    "focus-ring ui-pressable relative inline-flex min-h-11 items-center justify-center overflow-hidden rounded-full border px-5 py-2 text-sm font-black uppercase tracking-[0.08em] transition-[transform,opacity,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    toneClass[tone],
    className,
  );
  const content = (
    <span className="relative z-10 inline-flex items-center gap-2">
      {iconLeft}
      {children}
      {iconRight}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
