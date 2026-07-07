import { z } from "zod";
import { COMPATIBLE_CATEGORY_SLUGS } from "@/lib/constants/catalog";

const requiredString = z.string().trim().min(1, "Campo obligatorio");
const urlString = z.string().trim().url("Usa una URL completa");
const optionalUrlString = z.string().trim().url("Usa una URL completa").optional().or(z.literal(""));
const phoneMx = z
  .string()
  .trim()
  .regex(/^(\+?52)?\D?\d{10}$|^52\d{10}$/, "Usa 10 dígitos MX o prefijo 52");

export const contactSchema = z.object({
  id: z.coerce.number().optional(),
  primary_call_phone: phoneMx,
  primary_whatsapp_phone: phoneMx,
  email: z.string().trim().email("Correo inválido"),
  instagram_href: urlString,
  facebook_href: urlString,
  youtube_href: optionalUrlString,
  is_active: z.coerce.boolean().default(true),
});

export const branchSchema = z.object({
  id: z.coerce.number().optional(),
  slug: requiredString,
  name: requiredString,
  facade_image_src: requiredString,
  street_and_number: requiredString,
  neighborhood: requiredString,
  city: requiredString,
  state: requiredString,
  postal_code: requiredString,
  landline_phone: requiredString,
  google_maps_href: urlString,
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().default(true),
});

export const categorySchema = z.object({
  id: z.coerce.number().optional(),
  slug: requiredString,
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().default(false),
  confirm_incompatible: z.coerce.boolean().optional(),
}).superRefine((value, ctx) => {
  const compatible = COMPATIBLE_CATEGORY_SLUGS.includes(value.slug as never);
  if (value.is_active && !compatible && !value.confirm_incompatible) {
    ctx.addIssue({
      code: "custom",
      path: ["slug"],
      message: "Esta categoría requiere confirmación antes de activarla",
    });
  }
});

export const productSchema = z.object({
  id: z.union([z.coerce.number(), z.string()]).optional(),
  name: requiredString,
  category_id: requiredString,
  description: z.string().trim().nullable().optional(),
  price: z
    .string()
    .trim()
    .regex(/^\d+$/, "El precio solo puede incluir dígitos")
    .transform((value) => Number(value))
    .nullable()
    .optional(),
  measurements: z.string().trim().nullable().optional(),
  material: z.string().trim().nullable().optional(),
  internal_code: requiredString,
  additional_observations: z.string().trim().nullable().optional(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().default(false),
});

export const mediaUrlSchema = z.object({
  id: z.coerce.number().optional(),
  src: requiredString,
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().default(true),
});
