import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';

export type TypedSupabaseBackendClient = SupabaseClient<Database>;

let client: TypedSupabaseBackendClient | undefined;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseBackendClient() {
  if (!import.meta.env.SSR) {
    throw new Error(
      'createSupabaseBackendClient can only be used on the server',
    );
  }

  if (client) {
    return client;
  }

  client = createClient<Database>(
    getRequiredEnv('VITE_SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  return client;
}
