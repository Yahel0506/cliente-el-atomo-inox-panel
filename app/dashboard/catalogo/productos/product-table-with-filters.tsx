"use client";

import Image from "next/image";
import { CaretDown, Eye, EyeSlash, Funnel, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/formatters/business";
import { deleteProductAction, toggleProductAction } from "@/features/catalog/actions";

type SortKey = "name" | "price";
type SortDirection = "asc" | "desc";

export type ProductTableBranch = {
  id: string;
  name: string;
};

export type ProductTableCategory = {
  id: string;
  name: string;
};

export type ProductTableRow = {
  id: string;
  name: string;
  internalCode: string;
  price: number | string | null;
  material: string | null;
  isActive: boolean;
  categoryId: string | null;
  mainPhotoSrc: string | null;
  categoryName: string | null;
  categoryCompatible: boolean;
  productPhotosCount: number;
  activeBranchesCount: number;
  activeBranchIds: string[];
  reviewWarnings: string[];
};

type ProductFilters = {
  material: "all" | "steel" | "other";
  visibility: "all" | "visible" | "hidden";
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  branches: string[];
  onlyReview: boolean;
};

const emptyFilters: ProductFilters = {
  material: "all",
  visibility: "all",
  categoryId: "all",
  minPrice: "",
  maxPrice: "",
  branches: [],
  onlyReview: false,
};

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parsePrice(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getActiveFilterCount(filters: ProductFilters) {
  return [
    filters.material !== "all",
    filters.visibility !== "all",
    filters.categoryId !== "all",
    filters.minPrice || filters.maxPrice,
    filters.branches.length > 0,
    filters.onlyReview,
  ].filter(Boolean).length;
}

function toggleValue(values: string[], value: string, checked: boolean) {
  if (checked) return values.includes(value) ? values : [...values, value];
  return values.filter((item) => item !== value);
}

export function ProductTableWithFilters({
  products,
  branches,
  categories,
}: {
  products: ProductTableRow[];
  branches: ProductTableBranch[];
  categories: ProductTableCategory[];
}) {
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>(emptyFilters);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const activeFilterCount = getActiveFilterCount(appliedFilters);

  useEffect(() => {
    return () => {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const minPrice = parsePrice(appliedFilters.minPrice);
    const maxPrice = parsePrice(appliedFilters.maxPrice);

    const filtered = products.filter((product) => {
      const isSteel = normalize(product.material).includes("acero inoxidable");
      if (appliedFilters.material === "steel" && !isSteel) return false;
      if (appliedFilters.material === "other" && isSteel) return false;
      if (appliedFilters.visibility === "visible" && !product.isActive) return false;
      if (appliedFilters.visibility === "hidden" && product.isActive) return false;
      if (appliedFilters.categoryId !== "all" && product.categoryId !== appliedFilters.categoryId) return false;

      const price = product.price === null || product.price === "" ? null : Number(product.price);
      const hasPrice = price !== null && Number.isFinite(price);
      if (minPrice !== null && (!hasPrice || price < minPrice)) return false;
      if (maxPrice !== null && (!hasPrice || price > maxPrice)) return false;

      if (appliedFilters.branches.length) {
        const matchesEmptyBranch = appliedFilters.branches.includes("sin-sucursal") && product.activeBranchIds.length === 0;
        const matchesSelectedBranch = product.activeBranchIds.some((branchId) => appliedFilters.branches.includes(branchId));
        if (!matchesEmptyBranch && !matchesSelectedBranch) return false;
      }

      return !appliedFilters.onlyReview || product.reviewWarnings.length > 0;
    });

    if (!sort) return filtered;

    return [...filtered].sort((first, second) => {
      if (sort.key === "name") {
        const result = collator.compare(first.name || "", second.name || "");
        return sort.direction === "asc" ? result : -result;
      }

      const firstPrice = first.price === null || first.price === "" ? null : Number(first.price);
      const secondPrice = second.price === null || second.price === "" ? null : Number(second.price);
      const firstHasPrice = firstPrice !== null && Number.isFinite(firstPrice);
      const secondHasPrice = secondPrice !== null && Number.isFinite(secondPrice);
      if (!firstHasPrice && !secondHasPrice) return 0;
      if (!firstHasPrice) return 1;
      if (!secondHasPrice) return -1;
      return sort.direction === "asc" ? firstPrice - secondPrice : secondPrice - firstPrice;
    });
  }, [appliedFilters, products, sort]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    closeFilterMenu();
  }

  function clearFilters() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    closeFilterMenu();
  }

  function openFilterMenu() {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    setMenuMounted(true);
    requestAnimationFrame(() => setMenuOpen(true));
  }

  function closeFilterMenu() {
    setMenuOpen(false);
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    menuTimerRef.current = setTimeout(() => setMenuMounted(false), 180);
  }

  function toggleFilterMenu() {
    if (menuOpen) {
      closeFilterMenu();
      return;
    }
    openFilterMenu();
  }

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  function renderSortHeader(label: string, sortKey: SortKey) {
    const active = sort?.key === sortKey;
    const direction = active ? sort.direction : "asc";
    const nextLabel =
      sortKey === "name"
        ? active && direction === "asc"
          ? "de Z a A"
          : "de A a Z"
        : active && direction === "asc"
          ? "de mayor a menor"
          : "de menor a mayor";
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className="focus-ring -mx-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-black text-[color:var(--muted)] transition-[background-color,color,transform] duration-160 ease-[var(--ease-out-premium)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)] active:scale-[0.98]"
        aria-label={`Ordenar ${label} ${nextLabel}`}
      >
        {label}
        <CaretDown
          size={13}
          weight="bold"
          className={[
            "transition-[transform,opacity] duration-180 ease-[var(--ease-out-premium)]",
            active ? "opacity-100" : "opacity-35",
            direction === "asc" ? "rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          Mostrando <strong className="text-[color:var(--foreground)]">{filteredProducts.length}</strong> de {products.length} productos.
        </p>
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={toggleFilterMenu}
            className="focus-ring ui-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[color:var(--panel-raised)] px-4 py-2 text-sm font-semibold shadow-[var(--shadow-control)] transition-[transform,background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:-translate-y-0.5 hover:bg-[color:var(--surface-soft)]"
          >
            <Funnel size={16} weight="fill" aria-hidden />
            Filtros
            {activeFilterCount ? <StatusBadge tone="warning">{activeFilterCount}</StatusBadge> : null}
            <CaretDown size={14} weight="bold" className={menuOpen ? "rotate-180 transition-transform duration-180 ease-[var(--ease-out-premium)]" : "transition-transform duration-180 ease-[var(--ease-out-premium)]"} aria-hidden />
          </button>
          {menuMounted ? (
            <div
              className={[
                "absolute left-0 z-30 mt-2 w-[min(calc(100vw-2rem),760px)] origin-top-left rounded-[1.25rem] bg-[color:var(--panel)] p-4 shadow-[var(--shadow-card)] ring-1 ring-[color:var(--border)]/55 sm:left-auto sm:right-0 sm:origin-top-right",
                "transition-[opacity,transform,filter] duration-180 ease-[var(--ease-out-premium)] motion-reduce:transition-none",
                menuOpen ? "translate-y-0 scale-100 opacity-100 blur-0" : "pointer-events-none -translate-y-1 scale-[0.985] opacity-0 blur-[1px]",
              ].join(" ")}
            >
              <form onSubmit={applyFilters} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Filtrar productos</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Combina criterios sin cambiar el orden de la tabla.</p>
                  </div>
                  {activeFilterCount ? <StatusBadge tone="warning">{activeFilterCount} activo(s)</StatusBadge> : <StatusBadge>Sin filtros</StatusBadge>}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <fieldset className="rounded-2xl bg-[color:var(--surface)] p-3">
                    <legend className="px-1 text-xs font-semibold text-[color:var(--muted)]">Material</legend>
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-[color:var(--panel-raised)] p-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      {[
                        ["all", "Todos"],
                        ["steel", "Acero inoxidable"],
                        ["other", "Otros"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDraftFilters((filters) => ({ ...filters, material: value as ProductFilters["material"] }))}
                          className={[
                            "rounded-full px-3 py-2 transition-[background-color,color,box-shadow,transform] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.98]",
                            draftFilters.material === value ? "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[var(--shadow-control)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl bg-[color:var(--surface)] p-3">
                    <legend className="px-1 text-xs font-semibold text-[color:var(--muted)]">Visibilidad</legend>
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-[color:var(--panel-raised)] p-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      {[
                        ["all", "Todos"],
                        ["visible", "Visible"],
                        ["hidden", "No visible"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDraftFilters((filters) => ({ ...filters, visibility: value as ProductFilters["visibility"] }))}
                          className={[
                            "rounded-full px-3 py-2 transition-[background-color,color,box-shadow,transform] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.98]",
                            draftFilters.visibility === value ? "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[var(--shadow-control)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block rounded-2xl bg-[color:var(--surface)] p-3">
                    <span className="px-1 text-xs font-semibold text-[color:var(--muted)]">Categoría</span>
                    <select
                      value={draftFilters.categoryId}
                      onChange={(event) => setDraftFilters((filters) => ({ ...filters, categoryId: event.target.value }))}
                      className="field-control mt-2 min-h-10 px-3 py-2"
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <fieldset className="rounded-2xl bg-[color:var(--surface)] p-3">
                    <legend className="px-1 text-xs font-semibold text-[color:var(--muted)]">Precio</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-[color:var(--muted)]">Mínimo</span>
                        <input
                          inputMode="numeric"
                          value={draftFilters.minPrice}
                          onChange={(event) => setDraftFilters((filters) => ({ ...filters, minPrice: event.target.value }))}
                          className="field-control min-h-10 px-3 py-2"
                          placeholder="0"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-[color:var(--muted)]">Máximo</span>
                        <input
                          inputMode="numeric"
                          value={draftFilters.maxPrice}
                          onChange={(event) => setDraftFilters((filters) => ({ ...filters, maxPrice: event.target.value }))}
                          className="field-control min-h-10 px-3 py-2"
                          placeholder="50000"
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl bg-[color:var(--surface)] p-3">
                    <legend className="px-1 text-xs font-semibold text-[color:var(--muted)]">Sucursales</legend>
                    <div className="mt-2 grid max-h-40 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={draftFilters.branches.includes("sin-sucursal")}
                          onChange={(event) =>
                            setDraftFilters((filters) => ({
                              ...filters,
                              branches: toggleValue(filters.branches, "sin-sucursal", event.target.checked),
                            }))
                          }
                        />
                        Sin sucursal disponible
                      </label>
                      {branches.map((branch) => (
                        <label key={branch.id} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={draftFilters.branches.includes(branch.id)}
                            onChange={(event) =>
                              setDraftFilters((filters) => ({
                                ...filters,
                                branches: toggleValue(filters.branches, branch.id, event.target.checked),
                              }))
                            }
                          />
                          {branch.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[color:var(--surface)] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <input
                      type="checkbox"
                      checked={draftFilters.onlyReview}
                      onChange={(event) => setDraftFilters((filters) => ({ ...filters, onlyReview: event.target.checked }))}
                    />
                    Solo elementos a revisión
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button type="button" tone="quiet" onClick={clearFilters}>Limpiar</Button>
                  <Button type="submit" tone="primary">Aplicar filtros</Button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {filteredProducts.length ? (
        <DataTable
          columns={[
            "Foto",
            renderSortHeader("Producto", "name"),
            "Categoría",
            renderSortHeader("Precio", "price"),
            "Estado",
            "Fotos",
            "Sucursales",
            "Revisión",
            "Acción",
          ]}
          rows={filteredProducts.map((product) => [
            product.mainPhotoSrc ? (
              <div className="relative h-14 w-16 overflow-hidden rounded-xl bg-[color:var(--surface-soft)] shadow-[var(--shadow-control)]">
                <Image src={product.mainPhotoSrc} alt="" fill className="object-cover" sizes="64px" unoptimized />
              </div>
            ) : (
              <span className="block h-14 w-16 rounded-xl bg-[color:var(--surface-soft)]" />
            ),
            <div key="name">
              <strong className="block">{product.name || "Sin nombre"}</strong>
              <span className="text-xs text-[color:var(--muted)]">Código/modelo: {product.internalCode || "Pendiente"}</span>
            </div>,
            product.categoryName ? (
              <span key="cat">
                {product.categoryName}
                <span className="mt-1 block">
                  <StatusBadge tone={product.categoryCompatible ? "active" : "danger"}>
                    {product.categoryCompatible ? "Funciona en catálogo" : "Requiere ajuste"}
                  </StatusBadge>
                </span>
              </span>
            ) : (
              <StatusBadge key="cat" tone="danger">
                Sin categoría
              </StatusBadge>
            ),
            <span key="price">{formatPrice(product.price)}</span>,
            <StatusBadge key="state" tone={product.isActive ? "active" : "hidden"}>
              {product.isActive ? "Visible" : "Oculto"}
            </StatusBadge>,
            <span key="photos">{product.productPhotosCount}</span>,
            <span key="branches">{product.activeBranchesCount}</span>,
            product.reviewWarnings.length ? (
              <div key="warn" className="flex flex-wrap gap-1">
                {product.reviewWarnings.map((warning) => (
                  <StatusBadge key={warning} tone="warning">
                    {warning}
                  </StatusBadge>
                ))}
              </div>
            ) : (
              <StatusBadge key="ok" tone="active">
                Publicable
              </StatusBadge>
            ),
            <div key="action" className="flex gap-2">
              <Button href={`/dashboard/catalogo/productos/${product.id}`} tone="chrome" iconLeft={<PencilSimple size={15} weight="fill" aria-hidden />}>Editar</Button>
              <form action={toggleProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="is_active" value={String(product.isActive)} />
                <Button type="submit" tone={product.isActive ? "chrome" : "primary"} iconLeft={product.isActive ? <EyeSlash size={15} weight="fill" /> : <Eye size={15} weight="fill" />}>
                  {product.isActive ? "Ocultar" : "Activar"}
                </Button>
              </form>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <ConfirmDeleteButton
                  compact
                  ariaLabel={`Eliminar ${product.name || "producto"}`}
                  title="Eliminar producto"
                  message={`Se eliminará "${product.name || "este producto"}" del catálogo junto con sus fotos, usos recomendados y relaciones con sucursales.`}
                  confirmLabel="Eliminar producto"
                />
              </form>
            </div>,
          ])}
        />
      ) : (
        <section className="rounded-[1.25rem] bg-[color:var(--panel)] p-6 text-center shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold">No hay productos con esos filtros</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Ajusta los criterios o limpia los filtros para volver a ver todo el catálogo.</p>
          <div className="mt-4">
            <Button type="button" tone="primary" onClick={clearFilters}>Limpiar filtros</Button>
          </div>
        </section>
      )}
    </>
  );
}
