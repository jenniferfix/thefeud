import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getJoinCodeRedisKey, getRedisClient } from '#/integrations/redis';
import { createSupabaseBackendClient } from '#/utils/supabase/backend';
import { createSupabaseServerClient } from '#/utils/supabase/server';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  providers: string[];
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

    const metadata = data.claims.app_metadata;
    const providers = Array.isArray(metadata?.providers)
      ? metadata.providers.filter(
          (provider): provider is string => typeof provider === 'string',
        )
      : typeof metadata?.provider === 'string'
        ? [metadata.provider]
        : [];

    return {
      user: {
        id: data.claims.sub,
        email: typeof data.claims.email === 'string' ? data.claims.email : null,
        providers,
      },
    };
  },
);

export const exchangeOAuthCode = createServerFn({ method: 'POST' })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(data.code);
    console.error('exchangeOAuthCodeError', error);
    return { success: !error };
  });

export const deleteUser = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { user } = await getServerAuth();
    if (!user) throw notFound();

    const backendSupa = createSupabaseBackendClient();
    const { data: gameInstances, error: lookupError } = await backendSupa
      .from('game_instance')
      .select('join_code')
      .eq('userid', user.id)
      .not('join_code', 'is', null);

    if (lookupError) {
      console.error('Failed to collect account join codes', lookupError);
      throw new Error('Unable to delete account');
    }

    const joinCodeKeys = [
      ...new Set(
        (gameInstances ?? []).flatMap(({ join_code }) =>
          join_code ? [getJoinCodeRedisKey(join_code)] : [],
        ),
      ),
    ];

    const { error: deleteError } = await backendSupa.auth.admin.deleteUser(
      user.id,
      false,
    );

    if (deleteError) {
      console.error('Failed to hard-delete account', deleteError);
      throw new Error('Unable to delete account');
    }

    try {
      const { error: signOutError } =
        await createSupabaseServerClient().auth.signOut({ scope: 'local' });
      if (signOutError) {
        console.error('Failed to clear deleted account session', signOutError);
      }
    } catch (error) {
      console.error('Failed to clear deleted account session', error);
    }

    if (joinCodeKeys.length > 0) {
      try {
        await getRedisClient().del(joinCodeKeys);
      } catch (error) {
        console.error('Failed to remove deleted account join codes', error);
      }
    }

    return { success: true as const };
  },
);
