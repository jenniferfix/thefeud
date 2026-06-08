import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import Navbar from "@/components/header/Navbar";

export const Route = createFileRoute("/_navbar-layout")({
  component: NavigationLayout,
});

function NavigationLayout() {
  return (
    <main className="absolute inset-0 flex flex-col">
      <Navbar />
      <Outlet />
    </main>
  );
}
