"use client";

import { useActionState, useMemo, useState } from "react";
import type { CatalogCategory, CatalogProduct, CatalogProductPhoto } from "@/lib/supabase/types";
import { saveProductFormAction, type ProductFormState } from "@/features/catalog/actions";
import { Button } from "@/components/ui/button";
import { decodeErrorParam } from "@/components/feedback/error-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImageUploadField } from "@/components/media/image-upload-field";
import { formatCategoryName } from "@/lib/formatters/catalog";
import { isCatalogProductModality } from "@/lib/catalog/product-modality";

const DEFAULT_MATERIAL = "Acero inoxidable";
const OTHER_MATERIAL = "__other__";

export function ProductForm({
  product,
  mainPhoto,
  categories,
  error,
}: {
  product?: CatalogProduct;
  mainPhoto?: CatalogProductPhoto;
  categories: CatalogCategory[];
  error?: string;
}) {
  const initialState: ProductFormState = { error: decodeErrorParam(error) || undefined };
  const [state, formAction] = useActionState(saveProductFormAction, initialState);
  const fields = state.fields;
  const field = (name: keyof NonNullable<ProductFormState["fields"]>, fallback?: string | number | null) => fields?.[name] ?? String(fallback ?? "");
  const selectedCategoryId = field("category_id", product?.category_id);
  const initialModality = field("modality", product?.modality ?? "sale");
  const initialPrice = field("price", product?.price);
  const [price, setPrice] = useState(initialPrice);
  const priceHasInvalidCharacters = /\D/.test(price);
  const [modalityError, setModalityError] = useState<string | null>(null);
  const initialMaterial = field("material", product?.material) || DEFAULT_MATERIAL;
  const initialMaterialMode = useMemo(() => (initialMaterial === DEFAULT_MATERIAL ? DEFAULT_MATERIAL : OTHER_MATERIAL), [initialMaterial]);
  const [materialMode, setMaterialMode] = useState(initialMaterialMode);
  const [customMaterial, setCustomMaterial] = useState(initialMaterial === DEFAULT_MATERIAL ? "" : initialMaterial);
  const materialValue = materialMode === DEFAULT_MATERIAL ? DEFAULT_MATERIAL : customMaterial;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="brand-surface rounded-lg p-6"
      onSubmit={(event) => {
        const modality = new FormData(event.currentTarget).get("modality");
        if (!isCatalogProductModality(modality)) {
          event.preventDefault();
          setModalityError("Selecciona Venta o Renta.");
          event.currentTarget.querySelector<HTMLSelectElement>('select[name="modality"]')?.focus();
          return;
        }
        if (priceHasInvalidCharacters) {
          event.preventDefault();
          event.currentTarget.querySelector<HTMLInputElement>('input[name="price"]')?.focus();
        }
      }}
    >
      {product ? <input type="hidden" name="id" value={String(product.id)} /> : null}
      {product?.slug ? <input type="hidden" name="slug" value={product.slug} /> : null}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Ficha de producto</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Captura lo básico primero. El panel crea el enlace interno por ti.</p>
        </div>
        {product ? <StatusBadge tone={product.is_active ? "active" : "hidden"}>{product.is_active ? "Visible" : "Oculto"}</StatusBadge> : <StatusBadge tone="active">Visible al crear</StatusBadge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageUploadField name="image_file" currentSrc={mainPhoto?.image_src} label="Imagen del producto" required={!product} />
        <div>
          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="sr-only">Datos principales</legend>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Nombre del producto *</span>
              <input name="name" defaultValue={field("name", product?.name)} className="field-control" placeholder="Ej. Carro taquero grande" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Código o modelo *</span>
              <input name="internal_code" defaultValue={field("internal_code", product?.internal_code)} className="field-control" placeholder="Ej. CT-120" required />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Categoría *</span>
              <select name="category_id" defaultValue={selectedCategoryId} className="field-control" required>
                <option value="">Selecciona categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || formatCategoryName(category.slug)}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="mt-6 grid gap-4 border-t border-[color:var(--border)] pt-6 md:grid-cols-2">
            <legend className="sr-only">Datos comerciales</legend>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Modalidad *</span>
              <select
                name="modality"
                defaultValue={initialModality}
                required
                aria-invalid={Boolean(modalityError)}
                aria-describedby={modalityError ? "product-modality-error" : undefined}
                className={`field-control ${modalityError ? "border-[color:var(--danger)] text-[color:var(--danger)] focus-visible:outline-[color:var(--danger)]" : ""}`}
                onChange={() => setModalityError(null)}
              >
                <option value="sale">Venta</option>
                <option value="rental">Renta</option>
              </select>
              {modalityError ? (
                <span id="product-modality-error" className="mt-1 block text-xs font-semibold text-[color:var(--danger)]">
                  {modalityError}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Precio</span>
              <input
                name="price"
                value={price}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-invalid={priceHasInvalidCharacters}
                aria-describedby="product-price-help"
                className={`field-control ${priceHasInvalidCharacters ? "border-[color:var(--danger)] text-[color:var(--danger)] focus-visible:outline-[color:var(--danger)]" : ""}`}
                onChange={(event) => setPrice(event.currentTarget.value)}
              />
              <span id="product-price-help" className={`mt-1 block text-xs ${priceHasInvalidCharacters ? "font-semibold text-[color:var(--danger)]" : "text-[color:var(--muted)]"}`}>
                {priceHasInvalidCharacters ? "Solo se permiten dígitos, sin letras, espacios, comas ni signos." : "Si lo dejas vacío, la web mostrará precio a consultar."}
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Material</span>
              <select value={materialMode} className="field-control" onChange={(event) => setMaterialMode(event.currentTarget.value)}>
                <option value={DEFAULT_MATERIAL}>Acero inoxidable</option>
                <option value={OTHER_MATERIAL}>Material distinto</option>
              </select>
              <input type="hidden" name="material" value={materialValue} />
            </label>
            {materialMode === OTHER_MATERIAL ? (
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Material distinto *</span>
                <input value={customMaterial} onChange={(event) => setCustomMaterial(event.currentTarget.value)} className="field-control" required placeholder="Ej. Acero galvanizado" />
              </label>
            ) : null}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Medidas</span>
              <input name="measurements" defaultValue={field("measurements", product?.measurements)} className="field-control" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Descripción</span>
              <textarea name="description" defaultValue={field("description", product?.description)} rows={4} className="field-control" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Observaciones para cotización</span>
              <textarea name="additional_observations" defaultValue={field("additional_observations", product?.additional_observations)} rows={3} className="field-control" />
            </label>
          </fieldset>
          <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="is_active" defaultChecked={fields ? fields.is_active === "on" : (product?.is_active ?? true)} /> Visible en web
          </label>
          {state.error ? <p className="mt-5 rounded-md border border-[color:var(--danger)]/45 bg-[color:var(--danger)]/10 p-3 text-sm text-[color:var(--danger)]">{state.error}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SubmitButton pendingLabel={product ? "Guardando cambios" : "Creando producto"}>{product ? "Guardar cambios" : "Crear producto"}</SubmitButton>
            <Button href="/dashboard/catalogo/productos" tone="quiet">Cancelar</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
