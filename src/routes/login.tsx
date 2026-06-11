import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@/components/auth/SignIn';

type LoginSearchParams = {
  redirect: string;
  error?: string;
};

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    return {
      redirect: (search?.redirect as string) || '/',
      error: typeof search.error === 'string' ? search.error : undefined,
    };
  },
  component: () => <LoginPage />,
});

const LoginPage = () => {
  const { redirect, error } = Route.useSearch();
  return <SignIn redirect={redirect} error={error} />;
};
