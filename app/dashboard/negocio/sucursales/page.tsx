import Image from "next/image";
import { Eye, EyeSlash, PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImageUploadField } from "@/components/media/image-upload-field";
import { ModalLayer } from "@/components/layout/modal-layer";
import { getBusinessAdminData } from "@/features/business/data";
import { getCatalogAdminData } from "@/features/catalog/data";
import { deleteBranchAction, saveBranchAction, toggleBranchAction } from "@/features/business/actions";

export default async function BranchesPage({ searchParams }: { searchParams?: Promise<{ error?: string; saved?: string; deleted?: string; edit?: string; new?: string }> }) {
  const params = await searchParams;
  const [business, catalog] = await Promise.all([getBusinessAdminData(), getCatalogAdminData()]);
  const editingBranch = params?.edit ? business.branches.find((branch) => String(branch.id) === params.edit) : undefined;
  const showModal = Boolean(params?.new || editingBranch || params?.error);

  return (
    <>
      <PageHeader
        title="Sucursales"
        help="Administra direcciones, teléfonos, mapa y fachada de cada punto de venta."
        action={<Button href="/dashboard/negocio/sucursales?new=1" tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>Nueva sucursal</Button>}
      />
      <ErrorMessage error={params?.error} />
      {params?.saved ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Sucursal guardada. Puede tardar hasta 5 minutos en verse en la web pública.</p> : null}
      {params?.deleted ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Sucursal eliminada.</p> : null}

      <DataTable
        columns={["Fachada", "Sucursal", "Dirección", "Estado", "Productos", "Revisión", "Acción"]}
        rows={business.branches.map((branch) => {
          const productCount = catalog.productBranches.filter((row) => String(row.branch_id) === String(branch.id)).length;
          const warnings = [!branch.facade_image_src ? "Sin fachada" : null, !branch.google_maps_href ? "Sin mapa" : null].filter(Boolean);
          return [
            branch.facade_image_src ? (
              <div key="img" className="relative h-14 w-20 overflow-hidden rounded-xl bg-[color:var(--surface-soft)] shadow-[var(--shadow-control)]">
                <Image src={branch.facade_image_src} alt="" fill className="object-cover" sizes="80px" unoptimized />
              </div>
            ) : (
              <span key="img" className="block h-14 w-20 rounded-xl bg-[color:var(--surface-soft)]" />
            ),
            <div key="name"><strong className="block">{branch.name}</strong><span className="text-xs text-[color:var(--muted)]">{branch.city}, {branch.state}</span></div>,
            <span key="addr" className="text-sm text-[color:var(--muted)]">{branch.street_and_number}, {branch.neighborhood}</span>,
            <StatusBadge key="state" tone={branch.is_active ? "active" : "hidden"}>{branch.is_active ? "Visible" : "Oculta"}</StatusBadge>,
            productCount,
            warnings.length ? <div key="warn" className="flex gap-1">{warnings.map((warning) => <StatusBadge key={warning} tone="warning">{warning}</StatusBadge>)}</div> : <StatusBadge key="ok" tone="active">Lista</StatusBadge>,
            <div key="action" className="flex gap-2">
              <Button href={`/dashboard/negocio/sucursales?edit=${branch.id}`} tone="chrome" iconLeft={<PencilSimple size={15} weight="fill" aria-hidden />}>Editar</Button>
              <form action={toggleBranchAction}>
                <input type="hidden" name="id" value={branch.id} />
                <input type="hidden" name="is_active" value={String(branch.is_active)} />
                <Button type="submit" tone="chrome" iconLeft={branch.is_active ? <EyeSlash size={15} weight="fill" /> : <Eye size={15} weight="fill" />}>{branch.is_active ? "Ocultar" : "Activar"}</Button>
              </form>
              <form action={deleteBranchAction}>
                <input type="hidden" name="id" value={branch.id} />
                <ConfirmDeleteButton
                  compact
                  ariaLabel={`Eliminar ${branch.name}`}
                  title="Eliminar sucursal"
                  message={`Se eliminará "${branch.name}" junto con su fachada y sus relaciones con productos.`}
                  confirmLabel="Eliminar sucursal"
                />
              </form>
            </div>,
          ];
        })}
      />

      {showModal ? (
        <ModalLayer>
          <form action={saveBranchAction} encType="multipart/form-data" className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[1.5rem] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{editingBranch ? "Editar sucursal" : "Nueva sucursal"}</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">La fachada se convierte a WebP y se guarda en Storage.</p>
              </div>
              <Button href="/dashboard/negocio/sucursales" tone="quiet">Cerrar</Button>
            </div>
            {editingBranch ? <input type="hidden" name="id" value={editingBranch.id} /> : null}
            {editingBranch ? <input type="hidden" name="slug" value={editingBranch.slug} /> : null}
            <input type="hidden" name="current_facade_image_src" value={editingBranch?.facade_image_src || ""} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <ImageUploadField name="facade_image_file" currentSrc={editingBranch?.facade_image_src} label="Foto de fachada" required={!editingBranch} />
              <div className="grid gap-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Nombre *</span>
                  <input name="name" defaultValue={editingBranch?.name} className="field-control" required />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Calle y número *</span>
                    <input name="street_and_number" defaultValue={editingBranch?.street_and_number} className="field-control" required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Colonia *</span>
                    <input name="neighborhood" defaultValue={editingBranch?.neighborhood} className="field-control" required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Ciudad *</span>
                    <input name="city" defaultValue={editingBranch?.city} className="field-control" required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Estado *</span>
                    <input name="state" defaultValue={editingBranch?.state} className="field-control" required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Código postal *</span>
                    <input name="postal_code" defaultValue={editingBranch?.postal_code} className="field-control" required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Teléfono fijo *</span>
                    <input name="landline_phone" defaultValue={editingBranch?.landline_phone} className="field-control" required />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Enlace de Google Maps *</span>
                  <input type="url" name="google_maps_href" defaultValue={editingBranch?.google_maps_href} className="field-control" required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Orden</span>
                  <input type="number" name="display_order" defaultValue={editingBranch?.display_order ?? business.branches.length} className="field-control" />
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name="is_active" defaultChecked={editingBranch?.is_active ?? true} /> Visible en web
                </label>
                <div className="mt-2 flex gap-3">
                  <SubmitButton pendingLabel="Guardando sucursal">{editingBranch ? "Guardar cambios" : "Crear sucursal"}</SubmitButton>
                  <Button href="/dashboard/negocio/sucursales" tone="quiet">Cancelar</Button>
                </div>
              </div>
            </div>
          </form>
        </ModalLayer>
      ) : null}
    </>
  );
}
