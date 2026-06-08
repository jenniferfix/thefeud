"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect, useNavigate } from "@tanstack/react-router";
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getUserGamesQueryOptions,
  useGetGames,
  useGetUserGames,
} from "@/hooks/usegamequeries";
import { useCreateGameInstance } from "@/hooks/useinstancequeries";
import { useSupabaseAuth } from "@/supabaseauth";
import { cn } from "@/utils/utils";

const SelectAndStart = () => {
  const auth = useSupabaseAuth();
  // console.log(auth.user?.id);
  const navigate = useNavigate();
  // const { data, isError, isLoading, error } = useGetGames();
  const { data, isError, isLoading, error } = useGetUserGames(auth?.user?.id!);
  // const { data, isError, isLoading, error } = useSuspenseQuery(
  //   getUserGamesQueryOptions(auth?.user?.id!),
  // );
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null);
  const createGameInstance = useCreateGameInstance();
  const {
    data: instanceData,
    isSuccess: isInstanceSuccess,
    isError: isInstanceError,
  } = createGameInstance;
  const d = instanceData?.data;

  if (isError) return <div>{error?.message}</div>;
  if (isLoading || !instanceData) return <div>Loading...</div>;

  // if the component renders and we have the id of the new game,
  // we redirect to the game controller page
  if (!isInstanceError && isInstanceSuccess && instanceData) {
    if (instanceData) redirect({ to: `/c/${instanceData.data[0].id}` });
  }

  const handleStartGame = async (e: React.MouseEvent<HTMLElement>) => {
    if (!selectedGame) return;
    e.preventDefault();
    const newGame = await createGameInstance.mutateAsync({
      gameId: selectedGame,
    });
    if (newGame) {
      navigate({
        to: `/c/${newGame[0].id}`,
      });
    }
  };

  return (
    <React.Fragment>
      <div className="w-[300px] border rounded-sm my-2">
        <ScrollArea className="h-[200px]">
          <div
            role="listbox"
            aria-label="Scrollable listbox of games"
            className=""
          >
            {data?.map((g) => (
              <div
                key={g.id}
                role="option"
                aria-selected={selectedGame === g.id}
                onClick={() => setSelectedGame(g.id)}
                className={cn(
                  "cursor-pointer px-2 py-1 rounded-sm",
                  selectedGame === g.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {g.name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Button variant="default" onClick={handleStartGame}>
        Start Game
      </Button>
    </React.Fragment>
  );
};

export default SelectAndStart;
