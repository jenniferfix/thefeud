import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Navbar } from '#/components/header/Navbar';

export const Route = createFileRoute('/_navbar-layout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
