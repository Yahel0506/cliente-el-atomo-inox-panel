import { createPrivilegedClient } from "@/lib/supabase/admin";
import { isCompatibleCategorySlug } from "@/lib/constants/catalog";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { isPublicStorageUrl } from "@/lib/formatters/business";
import type {
  BusinessBranch,
  CatalogCategory,
  CatalogProduct,
  CatalogProductBranch,
  CatalogProductPhoto,
  CatalogProductRecommendedUse,
} from "@/lib/supabase/types";

export type CatalogAdminData = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  photos: CatalogProductPhoto[];
  recommendedUses: CatalogProductRecommendedUse[];
  productBranches: CatalogProductBranch[];
  branches: BusinessBranch[];
};

export async function getCatalogAdminData(): Promise<CatalogAdminData> {
  const supabase = await createPrivilegedClient();
  if (!supabase) {
    return {
      categories: [],
      products: [],
      photos: [],
      recommendedUses: [],
      productBranches: [],
      branches: [],
    };
  }

  const [categories, products, photos, uses, productBranches, branches] = await Promise.all([
    supabase.from("catalog_categories").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("catalog_products").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("catalog_product_photos").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("catalog_product_recommended_uses").select("*").order("display_order", { ascending: true }).order("id"),
    supabase.from("catalog_product_branches").select("*"),
    supabase.from("business_branches").select("*").order("display_order", { ascending: true }).order("id"),
  ]);

  return {
    categories: categories.data ?? [],
    products: products.data ?? [],
    photos: photos.data ?? [],
    recommendedUses: uses.data ?? [],
    productBranches: productBranches.data ?? [],
    branches: branches.data ?? [],
  };
}

export function getProductDiagnostics(product: CatalogProduct, data: CatalogAdminData) {
  const category = data.categories.find((item) => String(item.id) === String(product.category_id));
  const productPhotos = data.photos.filter((photo) => String(photo.product_id) === String(product.id));
  const productBranchRows = data.productBranches.filter((row) => String(row.product_id) === String(product.id));
  const activeBranches = productBranchRows.filter((row) =>
    data.branches.some((branch) => String(branch.id) === String(row.branch_id) && branch.is_active),
  );
  const mainPhoto = productPhotos[0];
  const env = getSupabaseEnv();
  const imageOk = mainPhoto ? isPublicStorageUrl(mainPhoto.image_src, env.url) : false;
  const categoryCompatible = isCompatibleCategorySlug(category?.slug);
  const warnings = [
    !product.name ? "Sin nombre" : null,
    !product.internal_code ? "Sin código/modelo" : null,
    !category ? "Sin categoría activa" : null,
    category && !categoryCompatible ? "Categoría requiere ajuste" : null,
    productPhotos.length === 0 ? "Sin foto" : null,
    mainPhoto && !imageOk ? "Foto incompatible" : null,
    activeBranches.length === 0 ? "Sin sucursal activa" : null,
  ].filter(Boolean) as string[];

  return {
    category,
    productPhotos,
    uses: data.recommendedUses.filter((use) => String(use.product_id) === String(product.id)),
    activeBranches,
    mainPhoto,
    imageOk,
    categoryCompatible,
    publishable: warnings.length === 0,
    warnings,
  };
}
