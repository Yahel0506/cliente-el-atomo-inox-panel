export const CATALOG_PRODUCT_MODALITIES = ["sale", "rental"] as const;

export type CatalogProductModality = (typeof CATALOG_PRODUCT_MODALITIES)[number];

export const CATALOG_PRODUCT_MODALITY_LABELS: Record<CatalogProductModality, string> = {
  sale: "Venta",
  rental: "Renta",
};

export function isCatalogProductModality(value: unknown): value is CatalogProductModality {
  return typeof value === "string" && CATALOG_PRODUCT_MODALITIES.includes(value as CatalogProductModality);
}

export function formatCatalogProductModality(modality: CatalogProductModality) {
  return CATALOG_PRODUCT_MODALITY_LABELS[modality];
}
