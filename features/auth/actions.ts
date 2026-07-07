"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfigError } from "@/lib/supabase/env";
import { translateErrorMessage } from "@/lib/formatters/errors";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  if (!supabase) {
    redirect(`/login?error=${encodeURIComponent(getSupabaseConfigError() || "Falta configurar la conexión del panel.")}`);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateErrorMessage(error.message, "No se pudo iniciar sesión."))}`);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
