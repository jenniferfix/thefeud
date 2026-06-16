import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_navbar-layout/_auth/c/')({
  beforeLoad: () => {
    throw redirect({ to: '/c/new' });
  },
});
