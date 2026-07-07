import { PageHeader } from "@/components/layout/page-header";
import { DisclosurePanel } from "@/components/disclosure/disclosure-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default function SettingsPage() {
  const env = getSupabaseEnv();

  return (
    <>
      <PageHeader
        title="Ajustes"
        help="Estado del panel y del sitio público. Úsalo cuando soporte necesite revisar configuración."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="metal-frame rounded-lg p-5">
          <h2 className="mb-4 text-lg font-semibold">Conexión del panel</h2>
          <div className="space-y-3 text-sm">
            <p className="flex items-center justify-between gap-3">Conexión pública <StatusBadge tone={env.hasPublicConfig ? "active" : "danger"}>{env.hasPublicConfig ? "Lista" : "Falta"}</StatusBadge></p>
            <p className="flex items-center justify-between gap-3">Permisos de edición <StatusBadge tone={env.hasServiceRole ? "active" : "warning"}>{env.hasServiceRole ? "Listos" : "Revisar"}</StatusBadge></p>
            <p className="break-all text-[color:var(--muted)]">{env.url || "Sin URL configurada"}</p>
          </div>
        </section>

        <section className="paper-note rounded-lg p-5">
          <h2 className="mb-2 text-lg font-black">Actualización del sitio público</h2>
          <p className="text-sm leading-6">Después de guardar, los cambios pueden tardar hasta 5 minutos en aparecer en el sitio.</p>
        </section>
      </div>

      <div className="mt-5">
        <DisclosurePanel title="Datos para soporte técnico">
          <pre className="overflow-x-auto rounded-md bg-black/25 p-4 text-xs">{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
ADMIN_REVALIDATE_SECRET=
WEB_REVALIDATE_URL=`}</pre>
        </DisclosurePanel>
      </div>
    </>
  );
}
