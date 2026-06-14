import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { Footer } from '#/components/Footer';
import Navbar from '@/components/header/Navbar';

export const Route = createFileRoute('/_navbar-layout')({
  component: NavigationLayout,
});

function NavigationLayout() {
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
