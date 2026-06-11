import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSafeRedirectPath } from '@/lib/auth';

export const Route = createFileRoute('/_navbar-layout/_auth')({
  beforeLoad: ({ context: { auth }, location }) => {
    if (!auth.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: getSafeRedirectPath(location.href),
        },
      });
    }
    return { user: auth.user };
  },
  component: () => <Outlet />,
});
