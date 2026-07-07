import Image from "next/image";
import Link from "next/link";
import { PencilSimple, Plus, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModalLayer } from "@/components/layout/modal-layer";
import { getBusinessAdminData } from "@/features/business/data";
import { deleteWorkMediaAction, saveWorkMediaAction } from "@/features/business/actions";
import type { BusinessWorkMediaRow } from "@/lib/supabase/types";

type WorkMediaKind = "process" | "result-video" | "result-image";
type Search = { error?: string; saved?: string; media?: string; id?: string; slot?: string; new?: string };

const labels: Record<WorkMediaKind, { singular: string; plural: string; accept: string }> = {
  process: { singular: "video de proceso", plural: "Videos de proceso", accept: "video/*" },
  "result-video": { singular: "video de resultado", plural: "Videos de resultados", accept: "video/*" },
  "result-image": { singular: "imagen de resultado", plural: "Imágenes de resultados", accept: "image/*" },
};

function isWorkMediaKind(value?: string): value is WorkMediaKind {
  return value === "process" || value === "result-video" || value === "result-image";
}

function editHref(kind: WorkMediaKind, row?: BusinessWorkMediaRow, slot?: number) {
  const params = new URLSearchParams({ media: kind });
  if (row?.id) params.set("id", String(row.id));
  if (!row?.id && slot !== undefined) params.set("slot", String(slot));
  if (!row?.id && slot === undefined) params.set("new", "1");
  return `/dashboard/negocio/trabajos?${params.toString()}`;
}

function MediaPreview({ kind, row }: { kind: WorkMediaKind; row?: BusinessWorkMediaRow }) {
  const src = row?.image_src || row?.video_src;
  if (!src) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center bg-[color:var(--surface-soft)] text-[color:var(--muted)]">
        {kind === "result-image" ? <Plus size={28} weight="bold" aria-hidden /> : <VideoCamera size={28} weight="fill" aria-hidden />}
      </div>
    );
  }

  if (kind === "result-image") {
    return <Image src={src} alt="" fill className="object-cover" sizes="280px" unoptimized />;
  }

  return <video src={src} className="h-full w-full object-cover" muted playsInline preload="metadata" />;
}

function MediaCard({ kind, row, slot }: { kind: WorkMediaKind; row?: BusinessWorkMediaRow; slot?: number }) {
  const title = row?.title || (slot !== undefined ? `${labels[kind].singular} ${slot + 1}` : `Nuevo ${labels[kind].singular}`);

  return (
    <Link
      href={editHref(kind, row, slot)}
      className="focus-ring motion-card group relative block h-56 w-[260px] shrink-0 overflow-hidden rounded-[1.25rem] bg-[color:var(--panel)] shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:shadow-[var(--shadow-soft)]"
    >
      <MediaPreview kind={kind} row={row} />
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/72 p-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{title}</p>
          <PencilSimple size={15} weight="fill" aria-hidden className="shrink-0" />
        </div>
        <p className="mt-1 text-xs text-white/70">Orden {row?.display_order ?? slot ?? 0}</p>
      </div>
      {row && kind !== "process" ? (
        <div className="absolute left-3 top-3">
          <StatusBadge tone={row.is_active ? "active" : "hidden"}>{row.is_active ? "Activo" : "Oculto"}</StatusBadge>
        </div>
      ) : null}
    </Link>
  );
}

function MediaCarousel({
  title,
  kind,
  rows,
  fixedSlots,
  minOne,
}: {
  title: string;
  kind: WorkMediaKind;
  rows: BusinessWorkMediaRow[];
  fixedSlots?: number;
  minOne?: boolean;
}) {
  const visibleRows = fixedSlots ? rows.slice(0, fixedSlots) : rows;
  const slots = fixedSlots ? Array.from({ length: fixedSlots }, (_, index) => visibleRows[index]) : visibleRows;

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[1.35rem] bg-[color:var(--panel)] p-4 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{kind === "process" ? "2 videos activos requeridos" : `${rows.filter((row) => row.is_active).length} activos`}</p>
        </div>
        {!fixedSlots ? (
          <Button href={editHref(kind)} tone="primary" iconLeft={<Plus size={16} weight="bold" aria-hidden />}>
            Agregar
          </Button>
        ) : null}
      </div>
      <div className="max-w-full overflow-hidden">
        <div className="flex max-w-full gap-4 overflow-x-auto overscroll-x-contain pb-2">
        {fixedSlots
          ? slots.map((row, index) => <MediaCard key={row?.id || `slot-${index}`} kind={kind} row={row} slot={index} />)
          : visibleRows.map((row) => <MediaCard key={row.id} kind={kind} row={row} />)}
        {!fixedSlots && !visibleRows.length && minOne ? <MediaCard kind={kind} /> : null}
        </div>
      </div>
    </section>
  );
}

function findSelected(kind: WorkMediaKind, data: Awaited<ReturnType<typeof getBusinessAdminData>>, id?: string) {
  const rows = kind === "process" ? data.processVideos : kind === "result-video" ? data.resultVideos : data.resultImages;
  return id ? rows.find((row) => String(row.id) === id) : undefined;
}

export default async function WorksPage({ searchParams }: { searchParams?: Promise<Search> }) {
  const params = await searchParams;
  const data = await getBusinessAdminData();
  const modalKind = isWorkMediaKind(params?.media) ? params.media : undefined;
  const selected = modalKind ? findSelected(modalKind, data, params?.id) : undefined;
  const slot = Number(params?.slot || 0);
  const showModal = Boolean(modalKind && (selected || params?.new || params?.slot));

  return (
    <>
      <PageHeader title="Trabajos" help="Administra fotos y videos que aparecen en la sección de trabajos del sitio público." />
      <ErrorMessage error={params?.error} />
      {params?.saved ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Archivo guardado. Puede tardar hasta 5 minutos en verse en el sitio público.</p> : null}

      <div className="grid min-w-0 gap-5">
        <MediaCarousel title="Videos de proceso" kind="process" rows={data.processVideos} fixedSlots={2} />
        <MediaCarousel title="Videos de resultados" kind="result-video" rows={data.resultVideos} minOne />
        <MediaCarousel title="Imágenes de resultados" kind="result-image" rows={data.resultImages} minOne />
      </div>

      {showModal && modalKind ? (
        <ModalLayer>
          <div className="w-full max-w-3xl rounded-[1.5rem] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{selected ? "Editar" : "Agregar"} {labels[modalKind].singular}</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{modalKind === "result-image" ? "La imagen se guardará como WebP de máximo 1MB." : "El video se guardará como WebM de máximo 10MB y 60 segundos."}</p>
              </div>
              <Button href="/dashboard/negocio/trabajos" tone="quiet">Cerrar</Button>
            </div>

            <form action={saveWorkMediaAction} encType="multipart/form-data" className="grid gap-4">
              <input type="hidden" name="kind" value={modalKind} />
              {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Reemplazar medio{selected ? "" : " *"}</span>
                <input name="media_file" type="file" accept={labels[modalKind].accept} className="field-control" required={!selected} />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Título</span>
                  <input name="title" defaultValue={selected?.title || ""} className="field-control" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Alt text</span>
                  <input name="alt_text" defaultValue={selected?.alt_text || ""} className="field-control" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Orden de aparición</span>
                  <input name="display_order" type="number" defaultValue={selected?.display_order ?? (params?.slot ? slot : 0)} className="field-control" />
                </label>
                {modalKind !== "process" ? (
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" name="is_active" defaultChecked={selected?.is_active ?? true} /> Activo
                  </label>
                ) : null}
              </div>
              <div className="flex gap-3">
                <SubmitButton pendingLabel="Guardando">Guardar</SubmitButton>
                <Button href="/dashboard/negocio/trabajos" tone="quiet">Cancelar</Button>
              </div>
            </form>
            {selected && modalKind !== "process" ? (
              <form action={deleteWorkMediaAction} className="mt-4 border-t border-[color:var(--border)] pt-4">
                <input type="hidden" name="kind" value={modalKind} />
                <input type="hidden" name="id" value={selected.id} />
                <ConfirmDeleteButton
                  title="Eliminar medio"
                  message={`Se eliminará este ${labels[modalKind].singular} del carrusel y también se borrará su archivo del bucket.`}
                  confirmLabel="Eliminar medio"
                >
                  Eliminar
                </ConfirmDeleteButton>
              </form>
            ) : null}
          </div>
        </ModalLayer>
      ) : null}
    </>
  );
}
