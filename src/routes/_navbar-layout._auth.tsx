import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_navbar-layout/_auth")({
  beforeLoad: async ({ context: { auth, queryClient }, location }) => {
    if (!auth || !(await auth?.checkAuthenticated())) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
    return { auth, queryClient };
  },
  component: () => <Outlet />,
});
