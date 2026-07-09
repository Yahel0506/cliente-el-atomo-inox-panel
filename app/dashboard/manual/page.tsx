import { PageHeader } from "@/components/layout/page-header";
import { ManualGuide } from "@/features/manual/manual-guide";

export default function ManualPage() {
  return (
    <>
      <PageHeader
        title="Manual del panel"
        help="Guía interactiva para consultar cómo usar las secciones principales del panel administrativo."
      />
      <ManualGuide />
    </>
  );
}
