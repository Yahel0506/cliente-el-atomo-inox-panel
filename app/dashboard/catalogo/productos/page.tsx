import Image from "next/image";
import { Eye, EyeSlash, PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/feedback/states";
import { formatPrice } from "@/lib/formatters/business";
import { formatCategoryName } from "@/lib/formatters/catalog";
import { getCatalogAdminData, getProductDiagnostics } from "@/features/catalog/data";
import { deleteProductAction, toggleProductAction } from "@/features/catalog/actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const data = await getCatalogAdminData();
  const active = data.products.filter((product) => product.is_active).length;
  const incomplete = data.products.filter((product) => {
    const diagnostics = getProductDiagnostics(product, data);
    return diagnostics.warnings.length > 0 || diagnostics.advisoryWarnings.length > 0;
  }).length;

  if (!data.products.length) {
    return (
      <>
        <PageHeader title="Productos" help="Aquí se capturan las fichas que verá el cliente en el catálogo público." action={<Button href="/dashboard/catalogo/productos/nuevo" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>Nuevo producto</Button>} />
        <EmptyState title="Todavía no hay productos" detail="Crea el primer producto. El panel lo guardará como borrador hasta que tenga categoría, foto y datos mínimos." actionHref="/dashboard/catalogo/productos/nuevo" actionLabel="Crear primer producto" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Productos"
        help="Administra fichas del catálogo. El panel evita publicar productos incompletos."
        action={<Button href="/dashboard/catalogo/productos/nuevo" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>Nuevo producto</Button>}
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Visibles en web", active],
          ["Borradores u ocultos", data.products.length - active],
          ["Necesitan revisión", incomplete],
        ].map(([label, value], index) => (
          <div key={label} className="stagger-item rounded-[1.25rem] bg-[color:var(--panel)] p-4 shadow-[var(--shadow-card)]" style={{ animationDelay: `${index * 40}ms` }}>
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <ErrorMessage error={params?.error} />
      {params?.deleted ? (
        <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">
          Producto eliminado del catálogo.
        </p>
      ) : null}

      <DataTable
        columns={["Foto", "Producto", "Categoría", "Precio", "Estado", "Fotos", "Sucursales", "Revisión", "Acción"]}
        rows={data.products.map((product) => {
          const diagnostics = getProductDiagnostics(product, data);
          const reviewWarnings = [...diagnostics.warnings, ...diagnostics.advisoryWarnings];
          return [
            diagnostics.mainPhoto ? (
              <div className="relative h-14 w-16 overflow-hidden rounded-xl bg-[color:var(--surface-soft)] shadow-[var(--shadow-control)]">
                <Image src={diagnostics.mainPhoto.image_src} alt="" fill className="object-cover" sizes="64px" unoptimized />
              </div>
            ) : (
              <span className="block h-14 w-16 rounded-xl bg-[color:var(--surface-soft)]" />
            ),
            <div key="name">
              <strong className="block">{product.name || "Sin nombre"}</strong>
              <span className="text-xs text-[color:var(--muted)]">Código/modelo: {product.internal_code || "Pendiente"}</span>
            </div>,
            diagnostics.category ? (
              <span key="cat">
                {diagnostics.category.name || formatCategoryName(diagnostics.category.slug)}
                <span className="mt-1 block">
                  <StatusBadge tone={diagnostics.categoryCompatible ? "active" : "danger"}>
                    {diagnostics.categoryCompatible ? "Funciona en catálogo" : "Requiere ajuste"}
                  </StatusBadge>
                </span>
              </span>
            ) : (
              <StatusBadge key="cat" tone="danger">
                Sin categoría
              </StatusBadge>
            ),
            <span key="price">{formatPrice(product.price)}</span>,
            <StatusBadge key="state" tone={product.is_active ? "active" : "hidden"}>
              {product.is_active ? "Visible" : "Oculto"}
            </StatusBadge>,
            <span key="photos">{diagnostics.productPhotos.length}</span>,
            <span key="branches">{diagnostics.activeBranches.length}</span>,
            reviewWarnings.length ? (
              <div key="warn" className="flex flex-wrap gap-1">
                {reviewWarnings.map((warning) => (
                  <StatusBadge key={warning} tone="warning">
                    {warning}
                  </StatusBadge>
                ))}
              </div>
            ) : (
              <StatusBadge key="ok" tone="active">
                Publicable
              </StatusBadge>
            ),
            <div key="action" className="flex gap-2">
              <Button href={`/dashboard/catalogo/productos/${product.id}`} tone="chrome" iconLeft={<PencilSimple size={15} weight="fill" aria-hidden />}>Editar</Button>
              <form action={toggleProductAction}>
                <input type="hidden" name="id" value={String(product.id)} />
                <input type="hidden" name="is_active" value={String(product.is_active)} />
                <Button type="submit" tone={product.is_active ? "chrome" : "primary"} iconLeft={product.is_active ? <EyeSlash size={15} weight="fill" /> : <Eye size={15} weight="fill" />}>
                  {product.is_active ? "Ocultar" : "Activar"}
                </Button>
              </form>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={String(product.id)} />
                <ConfirmDeleteButton
                  compact
                  ariaLabel={`Eliminar ${product.name || "producto"}`}
                  title="Eliminar producto"
                  message={`Se eliminará "${product.name || "este producto"}" del catálogo junto con sus fotos, usos recomendados y relaciones con sucursales.`}
                  confirmLabel="Eliminar producto"
                />
              </form>
            </div>,
          ];
        })}
      />
    </>
  );
}
