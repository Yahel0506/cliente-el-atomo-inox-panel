"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddressBook, BookOpen, Buildings, Gauge, GearSix, Images, Package, Stack } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export const navIcons = {
  dashboard: Gauge,
  products: Package,
  families: Stack,
  contact: AddressBook,
  branches: Buildings,
  works: Images,
  settings: GearSix,
  manual: BookOpen,
};

export type NavIcon = keyof typeof navIcons;

export function NavLink({ href, label, icon }: { href: string; label: string; icon: NavIcon }) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const Icon = navIcons[icon];

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring ui-pressable group relative flex min-h-12 items-center gap-3 rounded-full px-3 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.985]",
        active
          ? "bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]"
          : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-160 ease-[var(--ease-out-premium)]",
          active ? "bg-[color:var(--accent)] text-black" : "bg-[color:var(--surface-soft)] text-current group-hover:bg-[color:var(--panel-raised)]",
        )}
      >
        <Icon size={18} weight="fill" aria-hidden />
      </span>
      {label}
    </Link>
  );
}
