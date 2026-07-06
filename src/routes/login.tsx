import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@/components/auth/SignIn';
import { type AuthRouteError, parseAuthRouteError } from '@/lib/auth';

type LoginSearchParams = {
  redirect: string;
  error?: AuthRouteError;
};

export const Route = createFileRoute('/login')({
  headers: () => ({
    'Cache-Control':
      'no-store, no-cache, must-revalidate,proxy-revalidate,max-age=0',
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      redirect: (search?.redirect as string) || '/',
      error: parseAuthRouteError(search.error),
    };
  },
  component: () => <LoginPage />,
});

const LoginPage = () => {
  const { redirect, error } = Route.useSearch();
  return <SignIn redirect={redirect} error={error} />;
};
