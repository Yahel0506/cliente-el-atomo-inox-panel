"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COMPATIBLE_CATEGORY_SLUGS, isCompatibleCategorySlug } from "@/lib/constants/catalog";
import { requireAdmin } from "@/lib/permissions/admin";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { categorySchema, productSchema } from "@/features/validation/schemas";
import { compressImageToWebp, isUploadedFile } from "@/features/media/processing";
import { buildStoragePath, MEDIA_BUCKETS, removePublicMedia, uploadPublicMedia } from "@/features/media/storage";
import { getCatalogAdminData, getProductDiagnostics } from "./data";
import { formatCategoryName } from "@/lib/formatters/catalog";
import { translateErrorMessage } from "@/lib/formatters/errors";
import { toPublicSlug } from "@/lib/formatters/slug";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(translateErrorMessage(message))}`);
}

type PrivilegedClient = NonNullable<Awaited<ReturnType<typeof createPrivilegedClient>>>;

export type ProductFormFields = {
  slug?: string;
  name?: string;
  internal_code?: string;
  category_id?: string;
  price?: string;
  material?: string;
  measurements?: string;
  description?: string;
  additional_observations?: string;
  is_active?: string;
};

export type ProductFormState = {
  error?: string;
  fields?: ProductFormFields;
  revision?: number;
};

async function getAvailableProductSlug(supabase: PrivilegedClient, seed: string, currentId?: string | number) {
  const base = toPublicSlug(seed) || "producto";

  for (let index = 0; index < 30; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data, error } = await supabase.from("catalog_products").select("id").eq("slug", candidate).maybeSingle();

    if (!error && (!data || String(data.id) === String(currentId))) return candidate;
  }

  return `${base}-${Date.now()}`;
}

function getProductFormFields(formData: FormData): ProductFormFields {
  return {
    slug: String(formData.get("slug") || ""),
    name: String(formData.get("name") || ""),
    internal_code: String(formData.get("internal_code") || ""),
    category_id: String(formData.get("category_id") || ""),
    price: String(formData.get("price") || ""),
    material: String(formData.get("material") || ""),
    measurements: String(formData.get("measurements") || ""),
    description: String(formData.get("description") || ""),
    additional_observations: String(formData.get("additional_observations") || ""),
    is_active: formData.get("is_active") === "on" ? "on" : "",
  };
}

function productFail(mode: "redirect" | "state", path: string, message: string, formData: FormData): ProductFormState | never {
  const translatedMessage = translateErrorMessage(message);
  if (mode === "state") {
    return {
      error: translatedMessage,
      fields: getProductFormFields(formData),
      revision: Date.now(),
    };
  }

  redirect(`${path}?error=${encodeURIComponent(translatedMessage)}`);
}

function getOptionalFile(formData: FormData, key: string) {
  const file = formData.get(key);
  return isUploadedFile(file) ? file : null;
}

async function saveMainProductImage(supabase: PrivilegedClient, productId: string | number, file: File, altText: string) {
  const image = await compressImageToWebp(file);
  const publicUrl = await uploadPublicMedia({
    supabase,
    bucket: MEDIA_BUCKETS.productImages,
    path: buildStoragePath(`products/${String(productId)}`, "webp"),
    body: image,
    contentType: "image/webp",
  });

  const existing = await supabase
    .from("catalog_product_photos")
    .select("id,image_src")
    .eq("product_id", productId)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const payload = {
    image_src: publicUrl,
    alt_text: altText || "Producto El Atomo Inox",
    display_order: 0,
    is_cover: true,
  };

  const result = existing.data?.id
    ? await supabase.from("catalog_product_photos").update(payload).eq("id", existing.data.id)
    : await supabase.from("catalog_product_photos").insert({ ...payload, product_id: productId });

  if (result.error) {
    await removePublicMedia(supabase, MEDIA_BUCKETS.productImages, publicUrl);
    throw new Error(translateErrorMessage(result.error.message));
  }
  await removePublicMedia(supabase, MEDIA_BUCKETS.productImages, existing.data?.image_src);
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/catalogo/productos";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const id = String(formData.get("id"));
  const isActive = formData.get("is_active") === "true";

  if (!isActive) {
    const data = await getCatalogAdminData();
    const product = data.products.find((item) => String(item.id) === id);
    if (!product) fail(path, "Producto no encontrado.");
    const diagnostics = getProductDiagnostics(product, data);
    if (!diagnostics.publishable) {
      fail(path, `No se puede activar: ${diagnostics.warnings.join(", ")}`);
    }
  }

  const { error } = await supabase
    .from("catalog_products")
    .update({ is_active: !isActive, publication_status: isActive ? "draft" : "published" })
    .eq("id", id);
  if (error) fail(path, error.message);
  revalidatePath(path);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/catalogo/productos";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const productId = String(formData.get("id") || "");
  if (!productId) fail(path, "No se pudo identificar el producto.");

  const photos = await supabase.from("catalog_product_photos").select("image_src").eq("product_id", productId);
  if (photos.error) fail(path, photos.error.message);

  const draftProduct = await supabase
    .from("catalog_products")
    .update({ is_active: false, publication_status: "draft" })
    .eq("id", productId);
  if (draftProduct.error) fail(path, draftProduct.error.message);

  const branchLinks = await supabase.from("catalog_product_branches").delete().eq("product_id", productId);
  if (branchLinks.error) fail(path, branchLinks.error.message);

  const uses = await supabase.from("catalog_product_recommended_uses").delete().eq("product_id", productId);
  if (uses.error) fail(path, uses.error.message);

  const photoRows = await supabase.from("catalog_product_photos").delete().eq("product_id", productId);
  if (photoRows.error) fail(path, photoRows.error.message);

  const product = await supabase.from("catalog_products").delete().eq("id", productId);
  if (product.error) fail(path, product.error.message);

  await Promise.all((photos.data ?? []).map((photo) => removePublicMedia(supabase, MEDIA_BUCKETS.productImages, photo.image_src)));

  revalidatePath(path);
  redirect(`${path}?deleted=1`);
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/catalogo/categorias";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    name: formData.get("name") || formatCategoryName(String(formData.get("slug") || "")),
    description: formData.get("description") || undefined,
    display_order: formData.get("display_order") || 0,
    is_active: formData.get("is_active") === "on",
    confirm_incompatible: formData.get("confirm_incompatible") === "on",
  });
  if (!parsed.success) fail(path, parsed.error.issues[0]?.message || "Categoría inválida.");

  const { id, confirm_incompatible: _confirm, ...payload } = parsed.data;
  if (payload.is_active && !isCompatibleCategorySlug(payload.slug) && !_confirm) {
    fail(path, "Confirma esta categoría antes de activarla.");
  }

  const result = id
    ? await supabase.from("catalog_categories").update(payload).eq("id", id)
    : await supabase.from("catalog_categories").insert(payload);
  if (result.error) fail(path, result.error.message);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

export async function saveProductFormAction(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  return saveProduct(formData, "state");
}

export async function saveProductAction(formData: FormData) {
  await saveProduct(formData, "redirect");
}

async function saveProduct(formData: FormData, mode: "redirect" | "state"): Promise<ProductFormState> {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const id = formData.get("id");
  const publicId = toPublicSlug(String(formData.get("public_id") || ""));
  const path = id ? `/dashboard/catalogo/productos/${id}` : "/dashboard/catalogo/productos/nuevo";
  if (!supabase) return productFail(mode, path, "Falta configurar la conexión del panel.", formData);

  const parsed = productSchema.safeParse({
    id: id || undefined,
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    description: formData.get("description") || null,
    price: formData.get("price") || null,
    measurements: formData.get("measurements") || null,
    material: formData.get("material") || null,
    internal_code: formData.get("internal_code"),
    additional_observations: formData.get("additional_observations") || null,
    display_order: formData.has("display_order") ? formData.get("display_order") : undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) return productFail(mode, path, parsed.error.issues[0]?.message || "Producto inválido.", formData);

  const { id: productId, ...payload } = parsed.data;
  const requestedSlug = toPublicSlug(String(formData.get("slug") || ""));
  const slug = await getAvailableProductSlug(supabase, requestedSlug || publicId || String(payload.name || payload.internal_code), productId);
  const productPayload = { ...payload, slug };
  let nextId = productId;
  const imageFile = getOptionalFile(formData, "image_file");

  if (!productId && !imageFile) {
    return productFail(mode, path, "Añade una imagen del producto antes de crearlo.", formData);
  }

  if (productId) {
    const { error } = await supabase.from("catalog_products").update(productPayload).eq("id", productId);
    if (error) return productFail(mode, path, error.message, formData);
  } else {
    const insertPayload = {
      ...productPayload,
      display_order: productPayload.display_order ?? 0,
      publication_status: "draft",
      is_active: false,
    };
    const result = await supabase.from("catalog_products").insert(insertPayload).select("id").single();

    if (result.error) return productFail(mode, path, result.error.message, formData);
    nextId = (result.data as { id?: string | number } | null)?.id;
  }

  if (nextId && imageFile) {
    try {
      await saveMainProductImage(supabase, nextId, imageFile, payload.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la imagen.";
      if (!productId) {
        await supabase.from("catalog_products").delete().eq("id", nextId);
        return productFail(mode, path, message, formData);
      }
      return productFail(mode, `/dashboard/catalogo/productos/${nextId}`, message, formData);
    }
  }

  if (!productId && nextId && productPayload.is_active) {
    const publish = await supabase
      .from("catalog_products")
      .update({ is_active: true, publication_status: "published" })
      .eq("id", nextId);

    if (publish.error) {
      await supabase.from("catalog_products").delete().eq("id", nextId);
      return productFail(mode, path, publish.error.message, formData);
    }
  }

  revalidatePath("/dashboard/catalogo/productos");
  redirect(nextId ? `/dashboard/catalogo/productos/${nextId}?saved=1` : "/dashboard/catalogo/productos?saved=1");
}

export async function createMissingCompatibleCategoriesAction() {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const path = "/dashboard/catalogo/productos/nuevo";
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const existing = await supabase.from("catalog_categories").select("slug");
  if (existing.error) fail(path, existing.error.message);

  const existingSlugs = new Set((existing.data ?? []).map((category) => category.slug));
  const missing = COMPATIBLE_CATEGORY_SLUGS.filter((slug) => !existingSlugs.has(slug)).map((slug, index) => ({
    slug,
    name: formatCategoryName(slug),
    display_order: index,
    is_active: true,
  }));

  if (missing.length) {
    const { error } = await supabase.from("catalog_categories").insert(missing);
    if (error) fail(path, error.message);
  }

  revalidatePath("/dashboard/catalogo/productos/nuevo");
  revalidatePath("/dashboard/catalogo/categorias");
  redirect(`${path}?prepared=1`);
}

export async function addProductPhotoAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const productId = String(formData.get("product_id") || "");
  const path = `/dashboard/catalogo/productos/${productId}`;
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const imageFile = getOptionalFile(formData, "image_file");
  if (!productId || !imageFile) fail(path, "Selecciona una imagen para agregarla al producto.");

  const displayOrder = Number(formData.get("display_order") || 0);
  try {
    const image = await compressImageToWebp(imageFile);
    const imageSrc = await uploadPublicMedia({
      supabase,
      bucket: MEDIA_BUCKETS.productImages,
      path: buildStoragePath(`products/${productId}`, "webp"),
      body: image,
      contentType: "image/webp",
    });
    const { error } = await supabase.from("catalog_product_photos").insert({
      product_id: productId,
      image_src: imageSrc,
      alt_text: String(formData.get("alt_text") || "Producto El Atomo Inox"),
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      is_cover: displayOrder === 0,
    });
    if (error) fail(path, error.message);
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "No se pudo guardar la foto.");
  }
  revalidatePath(path);
  revalidatePath("/dashboard/catalogo/productos");
  redirect(`${path}?saved=photo`);
}

export async function addRecommendedUseAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const productId = String(formData.get("product_id") || "");
  const path = `/dashboard/catalogo/productos/${productId}`;
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");

  const useText = String(formData.get("use_text") || "").trim();
  if (!productId || !useText) fail(path, "Escribe un uso recomendado antes de guardar.");

  const displayOrder = Number(formData.get("display_order") || 0);
  const { error } = await supabase.from("catalog_product_recommended_uses").insert({
    product_id: productId,
    use_text: useText,
    display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
  });
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?saved=use`);
}

export async function deleteRecommendedUseAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const productId = String(formData.get("product_id") || "");
  const useId = Number(formData.get("use_id"));
  const path = `/dashboard/catalogo/productos/${productId}`;
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");
  if (!productId || !Number.isInteger(useId) || useId <= 0) fail(path, "No se pudo identificar el uso recomendado.");

  const { error } = await supabase
    .from("catalog_product_recommended_uses")
    .delete()
    .eq("id", useId)
    .eq("product_id", productId);
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?saved=use-deleted`);
}

export async function toggleProductBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createPrivilegedClient();
  const productId = String(formData.get("product_id") || "");
  const branchId = String(formData.get("branch_id") || "");
  const selected = formData.get("selected") === "true";
  const path = `/dashboard/catalogo/productos/${productId}`;
  if (!supabase) fail(path, "Falta configurar la conexión del panel.");
  if (!productId || !branchId) fail(path, "No se pudo identificar sucursal o producto.");

  const result = selected
    ? await supabase.from("catalog_product_branches").delete().eq("product_id", productId).eq("branch_id", branchId)
    : await supabase.from("catalog_product_branches").insert({ product_id: productId, branch_id: branchId });

  if (result.error) fail(path, result.error.message);
  revalidatePath(path);
}
