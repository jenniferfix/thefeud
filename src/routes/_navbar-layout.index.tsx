import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import Home from "@/components/home/Home";
import { getUserGamesQueryOptions } from "@/hooks/usegamequeries";

export const Route = createFileRoute("/_navbar-layout/")({
  loader: async ({ context: { auth, queryClient } }) => {
    if (!auth?.user) return;
    // console.log(auth?.user?.id);
    await queryClient.ensureQueryData(getUserGamesQueryOptions(auth.user.id));
  },
  component: HomeComponent,
});

function HomeComponent() {
  return <Home />;
}
