import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/lib/permissions/admin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
