"use client";

import { List, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { navIcons, type NavIcon } from "@/components/layout/nav-link";
import { cn } from "@/lib/utils";

export function MobileNavMenu({ nav }: { nav: { href: string; label: string; icon: NavIcon }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const drawer =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="drawer-layer fixed inset-0 z-[100] lg:hidden">
            <button type="button" className="drawer-scrim absolute inset-0 bg-black/55" aria-label="Cerrar navegación" onClick={() => setOpen(false)} />
            <aside className="mobile-drawer absolute inset-y-0 left-0 z-10 flex w-[min(21rem,calc(100vw-2rem))] flex-col bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <BrandLogo />
                <button
                  type="button"
                  className="focus-ring ui-pressable inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-full bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]"
                  aria-label="Cerrar navegación"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} weight="bold" aria-hidden />
                </button>
              </div>
              <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pb-4" aria-label="Principal móvil">
                {nav.map((item) => {
                  const Icon = navIcons[item.icon];
                  const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "focus-ring ui-pressable flex min-h-12 items-center gap-3 rounded-full px-3 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.985]",
                        active
                          ? "bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full",
                          active ? "bg-[color:var(--accent)] text-black" : "bg-[color:var(--surface-soft)] text-current",
                        )}
                      >
                        <Icon size={18} weight="fill" aria-hidden />
                      </span>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="focus-ring ui-pressable inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)] transition-[transform,background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.97] lg:hidden"
        aria-label="Abrir navegación"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <List size={20} weight="bold" aria-hidden />
      </button>
      {drawer}
    </>
  );
}
