export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeMexicoPhone(value: string) {
  const digits = onlyDigits(value);
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 12 && digits.startsWith("52")) return digits;
  return digits;
}

export function formatPhoneLabel(value: string | null | undefined) {
  if (!value) return "Sin telefono";
  const digits = onlyDigits(value);
  const national = digits.length === 12 && digits.startsWith("52") ? digits.slice(2) : digits;
  if (national.length !== 10) return value;
  return `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

export function toPhoneHref(value: string) {
  return `tel:${onlyDigits(value)}`;
}

export function toWhatsappHref(value: string, message = "Hola, quiero cotizar con El Atomo Inox.") {
  return `https://wa.me/${normalizeMexicoPhone(value)}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "Cotizacion personalizada";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(numeric)) {
    return `Desde ${new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(numeric)} MXN`;
  }
  return `Desde ${value}`;
}

export function isPublicStorageUrl(value: string, supabaseUrl?: string) {
  if (value.startsWith("/images/")) return true;
  if (!supabaseUrl) return value.includes("/storage/v1/object/public/");
  try {
    const expected = new URL(supabaseUrl).hostname;
    const actual = new URL(value).hostname;
    return expected === actual && value.includes("/storage/v1/object/public/");
  } catch {
    return false;
  }
}
