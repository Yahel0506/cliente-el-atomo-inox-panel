import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCatalogAdminData } from "@/features/catalog/data";

export default async function NewProductPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const data = await getCatalogAdminData();

  return (
    <>
      <PageHeader
        title="Nuevo producto"
        help="Los productos nuevos se guardan visibles por defecto, siempre que tengan foto, categoría y datos completos."
        action={
          <>
            <Button href="/dashboard/manual#productos" tone="chrome">
              ¿Cómo llenar este formulario?
            </Button>
            <Button href="/dashboard/catalogo/productos" tone="quiet">Volver</Button>
          </>
        }
      />
      {!data.categories.length ? (
        <section className="brand-surface max-w-2xl rounded-lg p-6">
          <h2 className="text-2xl font-semibold">Aún no hay categorías</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Cuando haya categorías registradas, podrás asignarlas a los productos desde este formulario.
          </p>
        </section>
      ) : (
        <ProductForm categories={data.categories} error={params?.error} />
      )}
    </>
  );
}
