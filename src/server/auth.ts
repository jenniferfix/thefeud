import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServerClient } from '#/utils/supabase/server';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export type ServerAuth = {
  user: AuthenticatedUser | null;
};

export const getServerAuth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServerAuth> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims.sub) {
      return { user: null };
    }

    return {
      user: {
        id: data.claims.sub,
        email: typeof data.claims.email === 'string' ? data.claims.email : null,
      },
    };
  },
);

export const exchangeOAuthCode = createServerFn({ method: 'POST' })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(data.code);

    return { success: !error };
  });
