import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import GameControl from "@/components/gamecontrol/GameControl";
import { getInstanceGameQueryOptions } from "@/hooks/useinstancequeries";

export const Route = createFileRoute("/_auth/c/$gameInstanceId")({
  loader: async ({ context: { queryClient }, params: { gameInstanceId } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getInstanceGameQueryOptions(gameInstanceId)),
    ]);
  },
  component: ControlComponent,
});

function ControlComponent() {
  const gameInstanceId = Route.useParams().gameInstanceId;
  const {
    data: { data: instanceGame },
  } = useSuspenseQuery(getInstanceGameQueryOptions(gameInstanceId));

  return (
    <GameControl
      instanceId={gameInstanceId}
      gameId={instanceGame?.games?.id!}
    />
  );
}
