import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import { getCatalogAdminData } from "@/features/catalog/data";
import { createMissingCompatibleCategoriesAction } from "@/features/catalog/actions";

export default async function NewProductPage({ searchParams }: { searchParams?: Promise<{ error?: string; prepared?: string }> }) {
  const params = await searchParams;
  const data = await getCatalogAdminData();

  return (
    <>
      <PageHeader
        title="Nuevo producto"
        help="Los productos nuevos se guardan visibles por defecto, siempre que tengan foto, categoría y datos completos."
        action={<Button href="/dashboard/catalogo/productos" tone="quiet">Volver</Button>}
      />
      {params?.prepared ? (
        <p className="mb-4 rounded-lg border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">
          Categorías compatibles listas. Ya puedes crear productos.
        </p>
      ) : null}
      {!data.categories.length ? (
        <section className="brand-surface max-w-2xl rounded-lg p-6">
          <h2 className="text-2xl font-semibold">Primero prepara categorías</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Para crear productos sin romper el catálogo, el panel necesita las categorías principales del sitio.
          </p>
          <form action={createMissingCompatibleCategoriesAction} className="mt-5">
            <SubmitButton pendingLabel="Preparando">Preparar categorías compatibles</SubmitButton>
          </form>
        </section>
      ) : (
        <ProductForm categories={data.categories} error={params?.error} />
      )}
    </>
  );
}
