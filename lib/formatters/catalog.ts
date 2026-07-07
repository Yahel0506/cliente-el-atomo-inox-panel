export function formatCategoryName(slugOrName: string | null | undefined) {
  if (!slugOrName) return "Sin categoría";
  return slugOrName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace(/\bDe\b/g, "de")
    .replace(/\bPara\b/g, "para")
    .replace(/\bBano\b/g, "Baño")
    .replace(/\bMaria\b/g, "María");
}
