export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const missingPublicConfig = [
    url ? null : "NEXT_PUBLIC_SUPABASE_URL",
    anonKey ? null : "NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY",
  ].filter(Boolean) as string[];

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
    serviceRoleKey,
    hasPublicConfig: Boolean(url && anonKey),
    hasServiceRole: Boolean(url && serviceRoleKey),
    missingPublicConfig,
  };
}

export function getSupabaseConfigError() {
  const env = getSupabaseEnv();
  if (env.hasPublicConfig) return null;

  return `Falta configurar la conexión del panel: ${env.missingPublicConfig.join(", ")}.`;
}
