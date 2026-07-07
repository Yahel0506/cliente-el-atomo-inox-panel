import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  tone?: "primary" | "chrome" | "quiet" | "danger";
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const tones = {
  primary: "shadow-[var(--shadow-control)] hover:opacity-90",
  chrome: "border-transparent bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)] hover:bg-[color:var(--surface-soft)]",
  quiet: "border-transparent bg-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
  danger: "border-transparent bg-[color:var(--danger)] text-white shadow-[var(--shadow-control)]",
};

export function Button({ href, tone = "chrome", iconLeft, iconRight, className, children, style, ...props }: ButtonProps) {
  const classes = cn(
    "focus-ring ui-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    "motion-safe:hover:-translate-y-0.5",
    tones[tone],
    className,
  );

  const content = (
    <>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </>
  );
  const primaryStyle =
    tone === "primary"
      ? {
          ...style,
          backgroundColor: "var(--primary-bg)",
          borderColor: "var(--primary-bg)",
          color: "var(--primary-fg)",
        }
      : style;

  if (href) {
    return (
      <Link href={href} className={classes} style={primaryStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} style={primaryStyle} {...props}>
      {content}
    </button>
  );
}
