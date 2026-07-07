import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DisclosurePanel } from "@/components/disclosure/disclosure-panel";
import { getCatalogAdminData, getProductDiagnostics } from "@/features/catalog/data";
import { addRecommendedUseAction, toggleProductBranchAction } from "@/features/catalog/actions";
import { ProductForm } from "../product-form";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [{ id }, query, data] = await Promise.all([params, searchParams, getCatalogAdminData()]);
  const product = data.products.find((item) => String(item.id) === id);
  if (!product) notFound();
  const diagnostics = getProductDiagnostics(product, data);
  const selectedBranchIds = new Set(diagnostics.activeBranches.map((row) => String(row.branch_id)));

  return (
    <>
      <PageHeader
        title={product.name || "Producto"}
        help="El panel protege la publicación cuando faltan categoría, foto o datos mínimos."
      />
      {query?.saved ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Cambios guardados. Puede tardar hasta 5 minutos en verse en la web pública.</p> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ProductForm product={product} mainPhoto={diagnostics.mainPhoto} categories={data.categories} error={query?.error} />
        <aside className="space-y-4">
          <section className="paper-note rounded-lg p-5">
            <h2 className="mb-3 font-black">Checklist de publicación</h2>
            <div className="space-y-2">
              {[
                ["Nombre", Boolean(product.name)],
                ["Código/modelo", Boolean(product.internal_code)],
                ["Categoría activa", Boolean(diagnostics.category?.is_active)],
                ["Categoría funciona en catálogo", diagnostics.categoryCompatible],
                ["Foto principal", Boolean(diagnostics.mainPhoto)],
                ["Imagen compatible", diagnostics.imageOk],
                ["Sucursal activa", diagnostics.activeBranches.length > 0],
              ].map(([label, ok]) => (
                <p key={String(label)} className="flex items-center justify-between gap-2 text-sm">
                  {label}
                  <StatusBadge tone={ok ? "active" : "danger"}>{ok ? "Listo" : "Falta"}</StatusBadge>
                </p>
              ))}
            </div>
          </section>
          <DisclosurePanel title={`Usos recomendados (${diagnostics.uses.length})`}>
            {diagnostics.uses.length ? (
              <ul className="list-disc pl-5">
                {diagnostics.uses.map((use) => <li key={use.id}>{use.use_text}</li>)}
              </ul>
            ) : (
              <p className="text-sm">Opcional. Si agregas usos, también ayudan en búsqueda.</p>
            )}
            <form action={addRecommendedUseAction} className="mt-4 grid gap-3">
              <input type="hidden" name="product_id" value={String(product.id)} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Uso recomendado</span>
                <input name="use_text" className="field-control" placeholder="Ej. Taquerías, eventos, cocina industrial" required />
              </label>
              <input type="hidden" name="display_order" value={diagnostics.uses.length} />
              <SubmitButton pendingLabel="Agregando uso">Agregar uso</SubmitButton>
            </form>
          </DisclosurePanel>
          <DisclosurePanel title={`Sucursales (${diagnostics.activeBranches.length})`} defaultOpen>
            {data.branches.length ? (
              <div className="space-y-2">
                {data.branches.map((branch) => {
                  const selected = selectedBranchIds.has(String(branch.id));
                  return (
                    <form key={branch.id} action={toggleProductBranchAction}>
                      <input type="hidden" name="product_id" value={String(product.id)} />
                      <input type="hidden" name="branch_id" value={String(branch.id)} />
                      <input type="hidden" name="selected" value={String(selected)} />
                      <button
                        type="submit"
                        className="focus-ring ui-pressable flex min-h-12 w-full cursor-pointer items-center justify-between rounded-full bg-[color:var(--panel)] px-3 text-left text-sm shadow-[var(--shadow-control)] transition-[transform,background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:bg-[color:var(--panel-raised)] active:scale-[0.99]"
                      >
                        <span>
                          <span className="block font-semibold text-[color:var(--foreground)]">{branch.name}</span>
                          <span className="text-xs text-[color:var(--muted)]">{branch.city}, {branch.state}</span>
                        </span>
                        <StatusBadge tone={selected ? "active" : "hidden"}>{selected ? "Disponible" : "Agregar"}</StatusBadge>
                      </button>
                    </form>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm">Agrega una sucursal activa para indicar dónde se puede consultar este producto.</p>
            )}
          </DisclosurePanel>
        </aside>
      </div>
    </>
  );
}
