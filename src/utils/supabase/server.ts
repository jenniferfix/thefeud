import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getCookies,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server';
import type { Database } from '@/types/supabase.types';

export type TypedSupabaseClient = SupabaseClient<Database>;
let client: TypedSupabaseClient;

export const createSupabaseServerClient = () => {
  if (client) {
    return client;
  }

  client = createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll: (cookiesToSet, headers) => {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(name, value, options);
          }

          for (const [name, value] of Object.entries(headers)) {
            setResponseHeader(
              name as Parameters<typeof setResponseHeader>[0],
              value,
            );
          }
        },
      },
    },
  );
  return client;
};
