import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase.types";

export type TypedSupabaseClient = SupabaseClient<Database>;
let client: TypedSupabaseClient;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  client = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
  );

  return client;
}
