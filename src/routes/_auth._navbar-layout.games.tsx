import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_navbar-layout/games')({
  component: Outlet,
});
