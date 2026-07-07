import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import type { Database } from "./types";
import { getSupabaseEnv } from "./env";

export async function createPrivilegedClient() {
  const env = getSupabaseEnv();

  if (env.hasServiceRole) {
    return createSupabaseClient<Database>(env.url, env.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient();
}
