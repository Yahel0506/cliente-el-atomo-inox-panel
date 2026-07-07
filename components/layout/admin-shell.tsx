import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { signOutAction } from "@/features/auth/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";
import { NavLink, type NavIcon } from "@/components/layout/nav-link";
import { RouteTransition } from "@/components/layout/route-transition";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import type { AdminSession } from "@/lib/permissions/admin";

const nav: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/dashboard", label: "Inicio", icon: "dashboard" },
  { href: "/dashboard/catalogo/productos", label: "Productos", icon: "products" },
  { href: "/dashboard/catalogo/categorias", label: "Categorías", icon: "families" },
  { href: "/dashboard/negocio/contacto", label: "Contacto", icon: "contact" },
  { href: "/dashboard/negocio/sucursales", label: "Sucursales", icon: "branches" },
  { href: "/dashboard/negocio/trabajos", label: "Trabajos", icon: "works" },
  { href: "/dashboard/ajustes", label: "Ajustes", icon: "settings" },
];

export function AdminShell({ children, session }: { children: React.ReactNode; session: AdminSession }) {
  return (
    <div className="min-h-dvh bg-[color:var(--background)] text-[color:var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-76 bg-[color:var(--surface)]/96 p-5 shadow-[var(--shadow-soft)] lg:block">
        <Link href="/dashboard" className="mb-7 flex items-center gap-3 rounded-[1.25rem]">
          <BrandLogo />
        </Link>
        <nav className="space-y-1.5" aria-label="Principal">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>
      </aside>

      <div className="lg:pl-76">
        <header className="sticky top-0 z-20 bg-[color:var(--surface)]/88 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNavMenu nav={nav} />
              <BrandLogo compact className="lg:hidden" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{session.email || "Administrador"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <form action={signOutAction}>
                <Button type="submit" tone="quiet" iconLeft={<SignOut size={16} weight="fill" aria-hidden />}>
                  Salir
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </div>
  );
}
