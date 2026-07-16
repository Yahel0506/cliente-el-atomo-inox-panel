import { PageHeader } from "@/components/layout/page-header";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCategoryName } from "@/lib/formatters/catalog";
import { getCatalogAdminData } from "@/features/catalog/data";

export default async function CategoriesPage({ searchParams }: { searchParams?: Promise<{ error?: string; saved?: string }> }) {
  const params = await searchParams;
  const data = await getCatalogAdminData();

  return (
    <>
      <PageHeader
        title="Categorías del catálogo"
        help="Agrupan los productos para que el cliente pueda encontrarlos fácil en el catálogo."
        action={
          <Button href="/dashboard/manual#categorias" tone="chrome">
            Ver ayuda de categorías
          </Button>
        }
      />

      <ErrorMessage error={params?.error} />
      {params?.saved ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Categoría guardada. Puede tardar hasta 5 minutos en verse en la web pública.</p> : null}

      <div className="mb-6">
        <DataTable
          columns={["Categoría", "Estado", "Productos"]}
          rows={data.categories.map((category) => [
            <span key="slug" className="text-sm font-semibold">{category.name || formatCategoryName(category.slug)}</span>,
            <StatusBadge key="state" tone={category.is_active ? "active" : "hidden"}>{category.is_active ? "Activa" : "Oculta"}</StatusBadge>,
            data.products.filter((product) => String(product.category_id) === String(category.id)).length,
          ])}
        />
      </div>
    </>
  );
}
