import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  id: string;
  email: string | undefined;
  role: string | undefined;
};

export function isAdminMetadata(appMetadata: Record<string, unknown> | undefined) {
  return appMetadata?.role === "admin" || appMetadata?.panel_role === "admin" || appMetadata?.is_admin === true;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminMetadata(user.app_metadata)) return null;

  return {
    id: user.id,
    email: user.email,
    role: String(user.app_metadata.role || user.app_metadata.panel_role || "admin"),
  };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
