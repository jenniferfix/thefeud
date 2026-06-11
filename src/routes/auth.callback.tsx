import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSafeRedirectPath } from '@/lib/auth';
import { exchangeOAuthCode } from '@/server/auth';

type AuthCallbackSearch = {
  code?: string;
  next?: string;
  error?: string;
};

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    next: typeof search.next === 'string' ? search.next : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const next = getSafeRedirectPath(deps.next);

    if (!deps.code || deps.error) {
      throw redirect({
        to: '/login',
        search: { redirect: next, error: 'oauth_callback' },
        statusCode: 303,
      });
    }

    const result = await exchangeOAuthCode({ data: { code: deps.code } });
    if (!result.success) {
      throw redirect({
        to: '/login',
        search: { redirect: next, error: 'oauth_callback' },
        statusCode: 303,
      });
    }

    throw redirect({ href: next, statusCode: 303 });
  },
  component: () => null,
});
