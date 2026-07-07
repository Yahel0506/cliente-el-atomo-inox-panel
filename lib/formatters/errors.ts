const knownErrorTranslations: Array<[RegExp, string]> = [
  [/Invalid login credentials/i, "Correo o contraseña incorrectos."],
  [/Email not confirmed/i, "Confirma tu correo antes de entrar."],
  [/User already registered/i, "Este correo ya está registrado."],
  [/JWT expired/i, "Tu sesión expiró. Vuelve a iniciar sesión."],
  [/permission denied/i, "No tienes permisos para realizar esta acción."],
  [/violates row-level security policy/i, "No tienes permisos para guardar estos cambios."],
  [/duplicate key value violates unique constraint/i, "Ya existe un registro con esos datos."],
  [/violates not-null constraint/i, "Falta completar un campo obligatorio."],
  [/invalid input syntax/i, "Uno de los campos tiene un formato inválido."],
  [/Published catalog products require at least one photo/i, "Los productos visibles necesitan al menos una imagen."],
  [/Published catalog products require at least one available branch/i, "La base todavía exige una sucursal disponible para publicar este producto."],
  [/new row for relation .* violates check constraint/i, "Uno de los datos no cumple las reglas de validación."],
  [/StorageApiError/i, "No se pudo guardar el archivo en Storage."],
  [/The resource already exists/i, "Ese archivo o registro ya existe."],
  [/mime type/i, "El tipo de archivo no es compatible."],
  [/payload too large|body exceeded|too large/i, "El archivo es demasiado pesado."],
  [/fetch failed|network/i, "No se pudo conectar con el servidor. Intenta de nuevo."],
];

export function translateErrorMessage(message: unknown, fallback = "Ocurrió un error. Intenta de nuevo.") {
  const text = String(message || "").trim();
  if (!text) return fallback;

  for (const [pattern, translation] of knownErrorTranslations) {
    if (pattern.test(text)) return translation;
  }

  if (/^[A-Za-z0-9_ .,'"()[\]:;-]+$/.test(text) && !/[áéíóúñ¿¡]/i.test(text)) {
    return fallback;
  }

  return text;
}
