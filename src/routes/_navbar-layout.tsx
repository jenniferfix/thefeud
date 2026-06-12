import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import Navbar from '@/components/header/Navbar';

export const Route = createFileRoute('/_navbar-layout')({
  component: NavigationLayout,
});

function NavigationLayout() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}
