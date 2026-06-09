import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_navbar-layout/_auth')({
  beforeLoad: async ({ context: { session, queryClient }, location }) => {
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
    return { session };
  },
  component: () => <Outlet />,
});
