import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_navbar-layout/_auth')({
  beforeLoad: ({ context: { auth }, location }) => {
    if (!auth.user) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
    return { user: auth.user };
  },
  component: () => <Outlet />,
});
