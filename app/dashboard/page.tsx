import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  Buildings,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Image as ImageIcon,
  Package,
  Plus,
  Storefront,
  VideoCamera,
  Warning,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getBusinessAdminData } from "@/features/business/data";
import { getCatalogAdminData, getProductDiagnostics } from "@/features/catalog/data";
import { getQualitySummary } from "@/features/dashboard/quality";

function safePercent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[1.35rem] bg-[color:var(--panel)] shadow-[var(--shadow-card)] ${className}`}>{children}</section>;
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon,
  color,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  href: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="motion-card group min-h-[148px] rounded-[1.35rem] bg-[color:var(--panel)] p-4 shadow-[var(--shadow-card)] transition-[transform,background-color,box-shadow] duration-180 ease-[var(--ease-out-premium)] hover:bg-[color:var(--panel-raised)] hover:shadow-[var(--shadow-soft)] active:scale-[0.99]"
      style={{ "--metric-color": color } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: "color-mix(in srgb, var(--metric-color), transparent 84%)",
            color: "var(--metric-color)",
          }}
        >
          {icon}
        </span>
        <ArrowRight size={17} weight="bold" className="text-[color:var(--muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className="mt-5 text-sm font-medium text-[color:var(--muted)]">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold leading-none">{value}</strong>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-[color:var(--muted)]">{detail}</p>
    </Link>
  );
}

function HealthRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = safePercent(value, total);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-[color:var(--muted)]">
          {value}/{total || 0}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [catalog, business] = await Promise.all([getCatalogAdminData(), getBusinessAdminData()]);
  const summary = getQualitySummary(catalog, business);

  const diagnostics = catalog.products.map((product) => getProductDiagnostics(product, catalog));
  const totalProducts = catalog.products.length;
  const activeProducts = catalog.products.filter((product) => product.is_active).length;
  const hiddenProducts = totalProducts - activeProducts;
  const productsWithPhoto = diagnostics.filter((item) => item.productPhotos.length > 0).length;
  const productsWithCategory = diagnostics.filter((item) => item.category).length;
  const productsWithBranch = diagnostics.filter((item) => item.activeBranches.length > 0).length;
  const publishableProducts = diagnostics.filter((item) => item.publishable).length;
  const activeBranches = business.branches.filter((branch) => branch.is_active).length;
  const branchesWithFacade = business.branches.filter((branch) => branch.is_active && branch.facade_image_src).length;
  const activeMedia = [...business.processVideos, ...business.resultVideos, ...business.resultImages].filter((item) => item.is_active);
  const mediaWithFile = activeMedia.filter((item) => item.video_src || item.image_src).length;
  const dangerAlerts = summary.alerts.filter((alert) => alert.severity === "danger").length;

  const catalogSegments = [
    { label: "Activos", value: activeProducts, color: "var(--success)" },
    { label: "Ocultos", value: hiddenProducts, color: "var(--info)" },
    { label: "Pendientes", value: Math.max(totalProducts - publishableProducts, 0), color: "var(--accent)" },
  ];

  return (
    <>
      <PageHeader
        title="Inicio"
        help="Lectura rápida del contenido que alimenta la web pública: catálogo, sucursales, contacto y trabajos."
        action={
          <>
            <Button href="/dashboard/manual#inicio" tone="chrome">
              Ver ayuda
            </Button>
            <Button href="/dashboard/catalogo/productos/nuevo" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>
              Nuevo producto
            </Button>
          </>
        }
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Productos publicables"
          value={`${publishableProducts}/${totalProducts}`}
          detail="Fichas con nombre, modelo, categoría e imagen listas."
          href="/dashboard/catalogo/productos"
          icon={<Package size={21} weight="fill" aria-hidden />}
          color="#f99a00"
        />
        <MetricCard
          label="Imágenes de producto"
          value={`${productsWithPhoto}/${totalProducts}`}
          detail="Los productos sin imagen no aparecen en la web pública."
          href="/dashboard/catalogo/productos?filtro=sin-foto"
          icon={<ImageIcon size={21} weight="fill" aria-hidden />}
          color="#2480d3"
        />
        <MetricCard
          label="Sucursales activas"
          value={`${branchesWithFacade}/${activeBranches}`}
          detail="Fachadas cargadas para las sucursales visibles."
          href="/dashboard/negocio/sucursales"
          icon={<Storefront size={21} weight="fill" aria-hidden />}
          color="#08b544"
        />
        <MetricCard
          label="Medios activos"
          value={`${mediaWithFile}/${activeMedia.length}`}
          detail="Videos e imágenes de trabajos con archivo válido."
          href="/dashboard/negocio/trabajos"
          icon={<VideoCamera size={21} weight="fill" aria-hidden />}
          color="#f13171"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Panel className="overflow-hidden p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
                <ChartBar size={18} weight="fill" className="text-[color:var(--accent)]" aria-hidden />
                Estado del catálogo
              </div>
              <h2 className="mt-2 text-2xl font-semibold leading-tight">Inventario visible y pendiente</h2>
            </div>
            <StatusBadge tone={summary.alerts.length ? "warning" : "active"}>
              {summary.alerts.length ? `${summary.alerts.length} pendiente(s)` : "Todo estable"}
            </StatusBadge>
          </div>

          <div className="rounded-[1.15rem] bg-[color:var(--surface)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">Distribución de productos</p>
              <p className="text-sm text-[color:var(--muted)]">{totalProducts} total</p>
            </div>
            <div className="flex h-5 overflow-hidden rounded-full bg-[color:var(--surface-soft)]" aria-label="Distribución de productos">
              {catalogSegments.map((segment) => (
                <div
                  key={segment.label}
                  title={`${segment.label}: ${segment.value}`}
                  style={{ width: `${safePercent(segment.value, totalProducts)}%`, backgroundColor: segment.color }}
                />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {catalogSegments.map((segment) => (
                <div key={segment.label} className="rounded-[1rem] bg-[color:var(--panel-raised)] p-3 shadow-[var(--shadow-control)]">
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    {segment.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{segment.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-[1.15rem] bg-[color:var(--surface)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardText size={18} weight="fill" className="text-[color:var(--info)]" aria-hidden />
                Salud para publicación
              </h3>
              <HealthRow label="Con imagen" value={productsWithPhoto} total={totalProducts} color="var(--info)" />
              <HealthRow label="Con categoría asignada" value={productsWithCategory} total={totalProducts} color="var(--success)" />
              <HealthRow label="Con sucursal disponible" value={productsWithBranch} total={totalProducts} color={productsWithBranch === totalProducts ? "var(--success)" : "var(--accent)"} />
              <HealthRow label="Publicables" value={publishableProducts} total={totalProducts} color="var(--accent)" />
            </div>
            <div className="space-y-4 rounded-[1.15rem] bg-[color:var(--surface)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Buildings size={18} weight="fill" className="text-[color:var(--success)]" aria-hidden />
                Negocio y trabajos
              </h3>
              <HealthRow label="Sucursales con fachada" value={branchesWithFacade} total={activeBranches} color="var(--success)" />
              <HealthRow label="Medios con archivo" value={mediaWithFile} total={activeMedia.length} color="var(--danger)" />
              <HealthRow label="Contacto principal" value={business.contacts.filter((contact) => contact.is_active).length === 1 ? 1 : 0} total={1} color="var(--accent)" />
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Atención inmediata</h2>
              <StatusBadge tone={dangerAlerts ? "danger" : summary.alerts.length ? "warning" : "active"}>
                {dangerAlerts ? "Crítico" : summary.alerts.length ? "Revisar" : "Listo"}
              </StatusBadge>
            </div>
            <div className="space-y-3">
              {summary.alerts.length ? (
                summary.alerts.slice(0, 4).map((alert, index) => (
                  <Link
                    key={alert.title}
                    href={alert.href}
                    className="motion-card stagger-item block rounded-[1.1rem] bg-[color:var(--surface)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[transform,background-color,box-shadow] duration-180 ease-[var(--ease-out-premium)] hover:bg-[color:var(--panel-raised)] hover:shadow-[var(--shadow-control)] active:scale-[0.99]"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <span className="flex items-start gap-3">
                      <Warning
                        size={20}
                        weight="fill"
                        className={alert.severity === "danger" ? "mt-0.5 shrink-0 text-[color:var(--danger)]" : "mt-0.5 shrink-0 text-[color:var(--accent)]"}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <strong className="block text-sm font-semibold">{alert.title}</strong>
                        <span className="mt-1 block text-sm leading-5 text-[color:var(--muted)]">{alert.detail}</span>
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.1rem] bg-[color:var(--surface)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <CheckCircle size={22} weight="fill" className="mb-3 text-[color:var(--success)]" aria-hidden />
                  <p className="text-sm font-semibold">No hay bloqueos de contenido.</p>
                  <p className="mt-1 text-sm leading-5 text-[color:var(--muted)]">El catálogo, contacto y medios principales están listos para mostrarse.</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-4 text-xl font-semibold">Accesos rápidos</h2>
            <div className="grid gap-2">
              {[
                { href: "/dashboard/catalogo/productos", label: "Gestionar productos", icon: Package },
                { href: "/dashboard/negocio/sucursales", label: "Editar sucursales", icon: Storefront },
                { href: "/dashboard/negocio/trabajos", label: "Actualizar trabajos", icon: Wrench },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="ui-pressable flex min-h-12 items-center justify-between rounded-full bg-[color:var(--surface)] px-3 text-sm font-semibold transition-[transform,background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:bg-[color:var(--panel-raised)] hover:shadow-[var(--shadow-control)] active:scale-[0.99]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon size={17} weight="fill" className="shrink-0 text-[color:var(--accent)]" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ArrowRight size={16} weight="bold" className="shrink-0 text-[color:var(--muted)]" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
