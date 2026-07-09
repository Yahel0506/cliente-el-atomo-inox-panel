import {
  ArrowSquareOut,
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  PaperPlaneTilt,
  Phone,
  WhatsappLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { InfoToggletip } from "@/components/disclosure/info-toggletip";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatPhoneLabel, toPhoneHref, toWhatsappHref } from "@/lib/formatters/business";
import { getBusinessAdminData } from "@/features/business/data";
import { saveContactAction } from "@/features/business/actions";

type ContactPreviewItem = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  className: string;
};

function ContactPreviewCard({ item }: { item: ContactPreviewItem }) {
  return (
    <a
      className={`focus-ring ui-pressable flex min-h-16 items-center justify-between gap-3 rounded-[1.15rem] px-3 py-3 text-white shadow-[var(--shadow-control)] transition-[transform,opacity,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:opacity-95 hover:shadow-[var(--shadow-card)] ${item.className}`}
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18">{item.icon}</span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase">{item.label}</span>
          <span className="block truncate text-sm font-semibold">{item.value}</span>
        </span>
      </span>
      <ArrowSquareOut size={16} weight="fill" className="shrink-0" aria-hidden />
    </a>
  );
}

export default async function ContactPage({ searchParams }: { searchParams?: Promise<{ error?: string; saved?: string }> }) {
  const params = await searchParams;
  const data = await getBusinessAdminData();
  const active = data.contacts.find((contact) => contact.is_active) || data.contacts[0];
  const activeCount = data.contacts.filter((contact) => contact.is_active).length;

  return (
    <>
      <PageHeader
        title="Contacto global"
        help="Estos datos alimentan los botones de llamada, WhatsApp, correo y redes sociales del sitio público."
        action={
          <Button href="/dashboard/manual#contacto" tone="chrome">
            Ver ayuda de contacto
          </Button>
        }
      />

      {activeCount !== 1 ? (
        <p className="mb-4 rounded-md border border-[color:var(--danger)]/45 bg-[color:var(--danger)]/10 p-3 text-sm text-[color:var(--danger)]">
          Hay {activeCount} contactos principales activos. Guarda esta pantalla para dejar uno solo.
        </p>
      ) : null}
      <ErrorMessage error={params?.error} />
      {params?.saved ? <p className="mb-4 rounded-md border border-[color:var(--success)]/45 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">Cambios guardados. Pueden tardar hasta 5 minutos en verse en el sitio público.</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form action={saveContactAction} className="brand-surface rounded-[1.35rem] p-6">
          {active?.id ? <input type="hidden" name="id" value={active.id} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 flex items-center gap-1 text-sm font-semibold">
                Teléfono de llamada *
                <InfoToggletip label="Formato teléfono">Usa 10 dígitos de México o agrega prefijo 52.</InfoToggletip>
              </span>
              <input name="primary_call_phone" defaultValue={active?.primary_call_phone} className="field-control" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">WhatsApp *</span>
              <input name="primary_whatsapp_phone" defaultValue={active?.primary_whatsapp_phone} className="field-control" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Correo *</span>
              <input type="email" name="email" defaultValue={active?.email} className="field-control" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Instagram *</span>
              <input type="url" name="instagram_href" defaultValue={active?.instagram_href} className="field-control" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">Facebook *</span>
              <input type="url" name="facebook_href" defaultValue={active?.facebook_href} className="field-control" required />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">YouTube</span>
              <input type="url" name="youtube_href" defaultValue={active?.youtube_href || ""} className="field-control" placeholder="https://youtube.com/..." />
            </label>
          </div>
          <div className="mt-5">
            <SubmitButton pendingLabel="Guardando contacto">Guardar contacto</SubmitButton>
          </div>
        </form>

        <aside className="brand-surface rounded-[1.35rem] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Así saldrá en botones</h2>
            <StatusBadge tone={active ? "active" : "danger"}>{active ? "Configurado" : "Pendiente"}</StatusBadge>
          </div>
          {active ? (
            <div className="space-y-3 text-sm">
              {[
                {
                  label: "Llamar",
                  value: formatPhoneLabel(active.primary_call_phone),
                  href: toPhoneHref(active.primary_call_phone),
                  icon: <Phone size={19} weight="fill" aria-hidden />,
                  className: "bg-[#2563eb]",
                },
                {
                  label: "WhatsApp",
                  value: formatPhoneLabel(active.primary_whatsapp_phone),
                  href: toWhatsappHref(active.primary_whatsapp_phone),
                  icon: <WhatsappLogo size={20} weight="fill" aria-hidden />,
                  className: "bg-[#128c7e]",
                },
                {
                  label: "Correo",
                  value: active.email,
                  href: `mailto:${active.email}`,
                  icon: <EnvelopeSimple size={19} weight="fill" aria-hidden />,
                  className: "bg-[#b3261e]",
                },
                {
                  label: "Instagram",
                  value: "Ver perfil",
                  href: active.instagram_href,
                  icon: <InstagramLogo size={20} weight="fill" aria-hidden />,
                  className: "bg-[#c13584]",
                },
                {
                  label: "Facebook",
                  value: "Ver página",
                  href: active.facebook_href,
                  icon: <FacebookLogo size={20} weight="fill" aria-hidden />,
                  className: "bg-[#1877f2]",
                },
                {
                  label: "YouTube",
                  value: active.youtube_href ? "Ver canal" : "Sin enlace configurado",
                  href: active.youtube_href || "https://youtube.com/",
                  icon: active.youtube_href ? <YoutubeLogo size={21} weight="fill" aria-hidden /> : <PaperPlaneTilt size={19} weight="fill" aria-hidden />,
                  className: active.youtube_href ? "bg-[#cc0000]" : "bg-[color:var(--surface-soft)] text-[color:var(--muted)]",
                },
              ].map((item) => (
                <ContactPreviewCard key={item.label} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm">Guarda un contacto principal para mostrar llamadas, WhatsApp y correo.</p>
          )}
        </aside>
      </div>
    </>
  );
}
