import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Navbar } from '#/components/header/Navbar';

export const Route = createFileRoute('/_auth/_navbar-layout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <main className="h-full">
        <Outlet />
      </main>
    </>
  );
}
