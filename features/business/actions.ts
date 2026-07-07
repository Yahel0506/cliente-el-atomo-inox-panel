"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/admin";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { branchSchema, contactSchema } from "@/features/validation/schemas";
import { compressImageToWebp, compressVideoToWebm } from "@/features/media/processing";
import { buildStoragePath, MEDIA_BUCKETS, removePublicMedia, uploadPublicMedia } from "@/features/media/storage";
import { toPublicSlug } from "@/lib/formatters/slug";
import type { BusinessWorkMediaRow } from "@/lib/supabase/types";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

type PrivilegedClient = NonNullable<Awaited<ReturnType<typeof createPrivilegedClient>>>;
type WorkMediaKind = "process" | "result-video" | "result-image";

function getOptionalFile(formData: FormData, key: string) {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

async function uploadBranchImage(supabase: PrivilegedClient, file: File, branchSlug: string) {
  const image = await compressImageToWebp(file);
  return uploadPublicMedia({
    supabase,
    bucket: MEDIA_BUCKETS.branchImages,
    path: buildStoragePath(`branches/${branchSlug}`, "webp"),
    body: image,
    contentType: "image/webp",
  });
}

function isWorkMediaKind(value: string): value is WorkMediaKind {
  return value === "process" || value === "result-video" || value === "result-image";
}

async function getWorkMediaSource(supabase: PrivilegedClient, kind: WorkMediaKind, id: number) {
  if (kind === "result-image") {
    return supabase.from("business_work_result_images").select("image_src").eq("id", id).single();
  }
  if (kind === "result-video") {
    return supabase.from("business_work_result_videos").select("video_src").eq("id", id).single();
  }
  return supabase.from("business_work_process_videos").select("video_src").eq("id", id).single();
}

async function updateWorkMedia(supabase: PrivilegedClient, kind: WorkMediaKind, id: number, payload: Partial<BusinessWorkMediaRow>) {
  if (kind === "result-image") return supabase.from("business_work_result_images").update(payload).eq("id", id);
  if (kind === "result-video") return supabase.from("business_work_result_videos").update(payload).eq("id", id);
  return supabase.from("business_work_process_videos").update(payload).eq("id", id);
}

async function insertWorkMedia(supabase: PrivilegedClient, kind: WorkMediaKind, payload: Partial<BusinessWorkMediaRow>) {
  if (kind === "result-image") return supabase.from("business_work_result_images").insert(payload);
  if (kind === "result-video") return supabase.from("business_work_result_videos").insert(payload);
  return supabase.from("business_work_process_videos").insert(payload);
}

async function deleteWorkMediaRow(supabase: PrivilegedClient, kind: WorkMediaKind, id: number) {
  if (kind === "result-image") return supabase.from("business_work_result_images").delete().eq("id", id);
  if (kind === "result-video") return supabase.from("business_work_result_videos").delete().eq("id", id);
  return supabase.from("business_work_process_videos").delete().eq("id", id);
}

async function countWorkMediaRows(supabase: PrivilegedClient, kind: WorkMediaKind) {
  const query =
    kind === "result-image"
      ? supabase.from("business_work_result_images").select("id", { count: "exact", head: true })
      : kind === "result-video"
        ? supabase.from("business_work_result_videos").select("id", { count: "exact", head: true })
        : supabase.from("business_work_process_videos").select("id", { count: "exact", head: true });

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function uploadWorkMediaFile(supabase: PrivilegedClient, kind: WorkMediaKind, file: File) {
  if (kind === "result-image") {
    const image = await compressImageToWebp(file);
    const url = await uploadPublicMedia({
      supabase,
      bucket: MEDIA_BUCKETS.workResultImages,
      path: buildStoragePath("trabajos/resultados/imagenes", "webp"),
      body: image,
      contentType: "image/webp",
    });
    return { column: "image_src", bucket: MEDIA_BUCKETS.workResultImages, url };
  }

  const video = await compressVideoToWebm(file);
  const url = await uploadPublicMedia({
    supabase,
    bucket: MEDIA_BUCKETS.workVideos,
    path: buildStoragePath(kind === "process" ? "trabajos/proceso" : "trabajos/resultados/videos", "webm"),
    body: video,
    contentType: "video/webm",
  });
  return { column: "video_src", bucket: MEDIA_BUCKETS.workVideos, url };
}

async function normalizeProcessVideos(supabase: PrivilegedClient) {
  const { data, error } = await supabase
    .from("business_work_process_videos")
    .select("id")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);

  const activeIds = (data ?? []).slice(0, 2).map((row) => row.id);
  if (activeIds.length) {
    const { error: activeError } = await supabase.from("business_work_process_videos").update({ is_active: true }).in("id", activeIds);
    if (activeError) throw new Error(activeError.message);
  }

  const inactiveIds = (data ?? []).slice(2).map((row) => row.id);
  if (inactiveIds.length) {
    const { error: inactiveError } = await supabase.from("business_work_process_videos").update({ is_active: false }).in("id", inactiveIds);
    if (inactiveError) throw new Error(inactiveError.message);
  }
}

export async function saveContactAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  if (!supabase) fail("/dashboard/negocio/contacto", "Falta configurar la conexión del panel.");

  const parsed = contactSchema.safeParse({
    id: formData.get("id") || undefined,
    primary_call_phone: formData.get("primary_call_phone"),
    primary_whatsapp_phone: formData.get("primary_whatsapp_phone"),
    email: formData.get("email"),
    instagram_href: formData.get("instagram_href"),
    facebook_href: formData.get("facebook_href"),
    youtube_href: formData.get("youtube_href") || undefined,
    is_active: true,
  });

  if (!parsed.success) {
    fail("/dashboard/negocio/contacto", parsed.error.issues[0]?.message || "Datos inválidos.");
  }

  await supabase.from("business_contact_info").update({ is_active: false }).eq("is_active", true);

  const { id, ...payload } = parsed.data;
  const result = id
    ? await supabase.from("business_contact_info").update(payload).eq("id", id)
    : await supabase.from("business_contact_info").insert(payload);

  if (result.error) fail("/dashboard/negocio/contacto", result.error.message);
  revalidatePath("/dashboard/negocio/contacto");
  redirect("/dashboard/negocio/contacto?saved=1");
}

export async function toggleBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  if (!supabase) fail("/dashboard/negocio/sucursales", "Falta configurar la conexión del panel.");

  const id = Number(formData.get("id"));
  const isActive = formData.get("is_active") === "true";
  const { error } = await supabase.from("business_branches").update({ is_active: !isActive }).eq("id", id);
  if (error) fail("/dashboard/negocio/sucursales", error.message);
  revalidatePath("/dashboard/negocio/sucursales");
}

export async function deleteBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/negocio/sucursales";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const id = Number(formData.get("id") || 0);
  if (!id) fail(path, "No se pudo identificar la sucursal.");

  const branch = await supabase.from("business_branches").select("facade_image_src").eq("id", id).maybeSingle();
  if (branch.error) fail(path, branch.error.message);
  if (!branch.data) fail(path, "Sucursal no encontrada.");

  const productLinks = await supabase.from("catalog_product_branches").delete().eq("branch_id", id);
  if (productLinks.error) fail(path, productLinks.error.message);

  const result = await supabase.from("business_branches").delete().eq("id", id);
  if (result.error) fail(path, result.error.message);

  await removePublicMedia(supabase, MEDIA_BUCKETS.branchImages, branch.data.facade_image_src);

  revalidatePath(path);
  revalidatePath("/dashboard/catalogo/productos");
  redirect(`${path}?deleted=1`);
}

export async function saveBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/negocio/sucursales";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const name = String(formData.get("name") || "");
  const city = String(formData.get("city") || "");
  const slug = String(formData.get("slug") || "") || toPublicSlug(`${name} ${city}`);

  const imageFile = getOptionalFile(formData, "facade_image_file");
  let facadeImageSrc = String(formData.get("current_facade_image_src") || "");
  const previousFacadeImageSrc = facadeImageSrc;

  if (imageFile) {
    try {
      facadeImageSrc = await uploadBranchImage(supabase, imageFile, slug);
    } catch (error) {
      fail(path, error instanceof Error ? error.message : "No se pudo guardar la imagen de la sucursal.");
    }
  }

  const parsed = branchSchema.safeParse({
    id: formData.get("id") || undefined,
    slug,
    name,
    facade_image_src: facadeImageSrc,
    street_and_number: formData.get("street_and_number"),
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    postal_code: formData.get("postal_code"),
    landline_phone: formData.get("landline_phone"),
    google_maps_href: formData.get("google_maps_href"),
    display_order: formData.get("display_order") || 0,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) fail(path, parsed.error.issues[0]?.message || "Datos de sucursal inválidos.");

  const { id, ...payload } = parsed.data;
  const result = id
    ? await supabase.from("business_branches").update(payload).eq("id", id)
    : await supabase.from("business_branches").insert(payload);

  if (result.error) fail(path, result.error.message);
  if (imageFile) await removePublicMedia(supabase, MEDIA_BUCKETS.branchImages, previousFacadeImageSrc);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

export async function saveWorkMediaAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const kind = String(formData.get("kind"));
  const path = "/dashboard/negocio/trabajos";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");
  if (!isWorkMediaKind(kind)) fail(path, "Tipo de archivo inválido.");

  const id = Number(formData.get("id") || 0);
  const file = getOptionalFile(formData, "media_file");
  const payload: Partial<BusinessWorkMediaRow> = {
    title: String(formData.get("title") || "").trim() || null,
    alt_text: String(formData.get("alt_text") || "").trim() || null,
    display_order: Number(formData.get("display_order") || 0),
    is_active: kind === "process" ? true : formData.get("is_active") === "on",
  };
  if (!id && !file) fail(path, "Selecciona un archivo para crear este elemento.");
  let uploadedUrl: string | undefined;
  let uploadedBucket = kind === "result-image" ? MEDIA_BUCKETS.workResultImages : MEDIA_BUCKETS.workVideos;
  let databaseWritten = false;

  try {
    let previousUrl: string | undefined;
    let previousBucket = kind === "result-image" ? MEDIA_BUCKETS.workResultImages : MEDIA_BUCKETS.workVideos;

    if (file) {
      const upload = await uploadWorkMediaFile(supabase, kind, file);
      if (upload.column === "image_src") {
        payload.image_src = upload.url;
      } else {
        payload.video_src = upload.url;
      }
      previousBucket = upload.bucket;
      uploadedBucket = upload.bucket;
      uploadedUrl = upload.url;
    }

    if (id) {
      if (file) {
        const previous = await getWorkMediaSource(supabase, kind, id);
        if (!previous.error && previous.data) {
          previousUrl = "image_src" in previous.data ? previous.data.image_src : previous.data.video_src;
        }
      }
      const { error } = await updateWorkMedia(supabase, kind, id, payload);
      if (error) throw new Error(error.message);
      databaseWritten = true;
      await removePublicMedia(supabase, previousBucket, previousUrl);
    } else {
      if (kind === "process") {
        const count = await countWorkMediaRows(supabase, kind);
        if (count >= 2) throw new Error("Los videos de proceso están limitados a dos elementos.");
      }
      const { error } = await insertWorkMedia(supabase, kind, payload);
      if (error) throw new Error(error.message);
      databaseWritten = true;
    }

    if (kind === "process") {
      await normalizeProcessVideos(supabase);
    }
  } catch (error) {
    if (!databaseWritten) await removePublicMedia(supabase, uploadedBucket, uploadedUrl);
    fail(path, error instanceof Error ? error.message : "No se pudo guardar el archivo.");
  }

  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

export async function deleteWorkMediaAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const kind = String(formData.get("kind"));
  const id = Number(formData.get("id") || 0);
  const path = "/dashboard/negocio/trabajos";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");
  if (!id || !isWorkMediaKind(kind)) fail(path, "No se pudo identificar el archivo.");
  if (kind === "process") fail(path, "Los videos de proceso solo se pueden editar.");

  try {
    const count = await countWorkMediaRows(supabase, kind);
    if (count <= 1) throw new Error("Debe quedar al menos un elemento en este carrusel.");

    const previous = await getWorkMediaSource(supabase, kind, id);
    const publicUrl = previous.data ? ("image_src" in previous.data ? previous.data.image_src : previous.data.video_src) : undefined;
    const { error } = await deleteWorkMediaRow(supabase, kind, id);
    if (error) throw new Error(error.message);
    await removePublicMedia(supabase, kind === "result-image" ? MEDIA_BUCKETS.workResultImages : MEDIA_BUCKETS.workVideos, publicUrl);
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
  }

  revalidatePath(path);
  redirect(`${path}?saved=1`);
}
