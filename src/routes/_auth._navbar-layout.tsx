import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Footer } from '#/components/Footer';
import Navbar from '@/components/header/Navbar';

export const Route = createFileRoute('/_auth/_navbar-layout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="grow max-w-4xl">
        <Outlet />
      </main>
      <Footer className="max-w-4xl" />
    </div>
  );
}
