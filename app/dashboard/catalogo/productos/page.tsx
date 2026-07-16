import { Plus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/feedback/states";
import { formatCategoryName } from "@/lib/formatters/catalog";
import { getCatalogAdminData, getProductDiagnostics } from "@/features/catalog/data";
import { ProductTableWithFilters, type ProductTableBranch, type ProductTableCategory, type ProductTableRow } from "./product-table-with-filters";

type ProductSearchParams = {
  error?: string;
  deleted?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<ProductSearchParams>;
}) {
  const params = await searchParams;
  const data = await getCatalogAdminData();
  const active = data.products.filter((product) => product.is_active).length;
  const incomplete = data.products.filter((product) => {
    const diagnostics = getProductDiagnostics(product, data);
    return diagnostics.warnings.length > 0 || diagnostics.advisoryWarnings.length > 0;
  }).length;
  const productRows: ProductTableRow[] = data.products.map((product) => {
    const diagnostics = getProductDiagnostics(product, data);
    return {
      id: String(product.id),
      name: product.name,
      internalCode: product.internal_code,
      price: product.price,
      material: product.material,
      modality: product.modality,
      isActive: product.is_active,
      categoryId: product.category_id ? String(product.category_id) : null,
      mainPhotoSrc: diagnostics.mainPhoto?.image_src ?? null,
      categoryName: diagnostics.category ? diagnostics.category.name || formatCategoryName(diagnostics.category.slug) : null,
      categoryCompatible: diagnostics.categoryCompatible,
      productPhotosCount: diagnostics.productPhotos.length,
      activeBranchesCount: diagnostics.activeBranches.length,
      activeBranchIds: diagnostics.activeBranches.map((row) => String(row.branch_id)),
      reviewWarnings: [...diagnostics.warnings, ...diagnostics.advisoryWarnings],
    };
  });
  const filterBranches: ProductTableBranch[] = data.branches
    .filter((branch) => branch.is_active)
    .map((branch) => ({ id: String(branch.id), name: branch.name }));
  const filterCategories: ProductTableCategory[] = data.categories
    .filter((category) => category.is_active)
    .map((category) => ({ id: String(category.id), name: category.name || formatCategoryName(category.slug) }));

  if (!data.products.length) {
    return (
      <>
        <PageHeader
          title="Productos"
          help="Aquí se capturan las fichas que verá el cliente en el catálogo público."
          action={
            <>
              <Button href="/dashboard/manual#productos" tone="chrome">
                Ver ayuda
              </Button>
              <Button href="/dashboard/catalogo/productos/nuevo" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>Nuevo producto</Button>
            </>
          }
        />
        <EmptyState title="Todavía no hay productos" detail="Crea el primer producto. El panel lo guardará como borrador hasta que tenga categoría, foto y datos mínimos." actionHref="/dashboard/catalogo/productos/nuevo" actionLabel="Crear primer producto" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Productos"
        help="Administra fichas del catálogo. El panel evita publicar productos incompletos."
        action={
          <>
            <Button href="/dashboard/manual#productos" tone="chrome">
              Ver ayuda
            </Button>
            <Button href="/dashboard/catalogo/productos/nuevo" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>Nuevo producto</Button>
          </>
        }
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

      <ProductTableWithFilters products={productRows} branches={filterBranches} categories={filterCategories} />
    </>
  );
}
