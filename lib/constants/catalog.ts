export const COMPATIBLE_CATEGORY_SLUGS = [
  "carros-para-venta-de-tacos",
  "carros-para-venta-de-hot-dog",
  "carros-para-venta-de-elotes",
  "cazos",
  "bases-de-cazos",
  "freidoras",
  "bano-maria",
  "parrillas",
  "planchas",
  "comales",
  "vaporeras",
  "ollas",
  "hornos",
  "bancos",
  "tarjas",
  "mesas-de-trabajo",
] as const;

export type CompatibleCategorySlug = (typeof COMPATIBLE_CATEGORY_SLUGS)[number];

export function isCompatibleCategorySlug(slug: string | null | undefined) {
  return COMPATIBLE_CATEGORY_SLUGS.includes(slug as CompatibleCategorySlug);
}
