import { isCompatibleCategorySlug } from "@/lib/constants/catalog";
import { getProductDiagnostics, type CatalogAdminData } from "@/features/catalog/data";
import type { BusinessAdminData } from "@/features/business/data";

export type QualityAlert = {
  title: string;
  detail: string;
  href: string;
  severity: "warning" | "danger";
};

export function getQualitySummary(catalog: CatalogAdminData, business: BusinessAdminData) {
  const activeProducts = catalog.products.filter((product) => product.is_active);
  const hiddenProducts = catalog.products.filter((product) => !product.is_active);
  const productsWithoutPhoto = catalog.products.filter((product) => getProductDiagnostics(product, catalog).productPhotos.length === 0);
  const productsWithoutBranch = catalog.products.filter((product) => getProductDiagnostics(product, catalog).activeBranches.length === 0);
  const incompatibleCategories = catalog.categories.filter((category) => !isCompatibleCategorySlug(category.slug));
  const activeContacts = business.contacts.filter((contact) => contact.is_active);
  const branchesWithoutFacade = business.branches.filter((branch) => branch.is_active && !branch.facade_image_src);
  const badMedia = [...business.processVideos, ...business.resultVideos, ...business.resultImages].filter((item) => {
    const src = item.video_src || item.image_src || "";
    return item.is_active && !src;
  });

  const alerts: QualityAlert[] = [
    productsWithoutPhoto.length
      ? {
          title: "Productos sin foto",
          detail: `${productsWithoutPhoto.length} producto(s) no aparecerán completos si están activos.`,
          href: "/dashboard/catalogo/productos?filtro=sin-foto",
          severity: "danger",
        }
      : null,
    productsWithoutBranch.length
      ? {
          title: "Productos sin sucursal",
          detail: `${productsWithoutBranch.length} producto(s) no tienen disponibilidad asociada. No bloquea publicación, pero conviene revisarlo.`,
          href: "/dashboard/catalogo/productos?filtro=sin-sucursal",
          severity: "warning",
        }
      : null,
    incompatibleCategories.length
      ? {
          title: "Categorías por revisar",
          detail: `${incompatibleCategories.length} categoría(s) requieren ajuste antes de mostrarse bien en el catálogo.`,
          href: "/dashboard/catalogo/categorias",
          severity: "danger",
        }
      : null,
    activeContacts.length !== 1
      ? {
          title: "Contacto principal ambiguo",
          detail: `Hay ${activeContacts.length} contactos activos. Deja uno solo para evitar confusión.`,
          href: "/dashboard/negocio/contacto",
          severity: "danger",
        }
      : null,
    branchesWithoutFacade.length
      ? {
          title: "Sucursales sin fachada",
          detail: `${branchesWithoutFacade.length} sucursal(es) activas tienen ficha incompleta.`,
          href: "/dashboard/negocio/sucursales",
          severity: "warning",
        }
      : null,
    badMedia.length
      ? {
          title: "Archivo activo sin enlace",
          detail: `${badMedia.length} recurso(s) activo(s) no tienen archivo válido.`,
          href: "/dashboard/negocio/trabajos",
          severity: "danger",
        }
      : null,
  ].filter(Boolean) as QualityAlert[];

  return {
    cards: [
      { label: "Productos activos", value: activeProducts.length, href: "/dashboard/catalogo/productos" },
      { label: "Productos ocultos", value: hiddenProducts.length, href: "/dashboard/catalogo/productos?estado=oculto" },
      { label: "Sin foto", value: productsWithoutPhoto.length, href: "/dashboard/catalogo/productos?filtro=sin-foto" },
      { label: "Sin sucursal", value: productsWithoutBranch.length, href: "/dashboard/catalogo/productos?filtro=sin-sucursal" },
      { label: "Categorías por revisar", value: incompatibleCategories.length, href: "/dashboard/catalogo/categorias" },
      { label: "Sucursales activas", value: business.branches.filter((branch) => branch.is_active).length, href: "/dashboard/negocio/sucursales" },
      {
        label: "Archivos activos",
        value: [...business.processVideos, ...business.resultVideos, ...business.resultImages].filter((item) => item.is_active).length,
        href: "/dashboard/negocio/trabajos",
      },
      { label: "Contacto principal", value: activeContacts.length === 1 ? "Listo" : "Revisar", href: "/dashboard/negocio/contacto" },
    ],
    alerts,
  };
}
