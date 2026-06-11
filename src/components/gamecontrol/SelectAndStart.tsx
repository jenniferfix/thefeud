'use client';
import { redirect, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetUserGames } from '@/hooks/usegamequeries';
import { useCreateGameInstance } from '@/hooks/useinstancequeries';
import { useSupabaseAuth } from '@/supabaseauth';
import { cn } from '@/utils/utils';

const SelectAndStartInner = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const { data, isError, isLoading, error } = useGetUserGames(userId);
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null);
  const {
    data: instanceData,
    isSuccess: isInstanceSuccess,
    isError: isInstanceError,
    mutateAsync: createGameAsync,
  } = useCreateGameInstance();

  if (isError) return <div>{error?.message}</div>;
  if (isLoading || !data) return <div>Loading...</div>;

  // if the component renders and we have the id of the new game,
  // we redirect to the game controller page
  if (!isInstanceError && isInstanceSuccess && instanceData) {
    if (instanceData)
      redirect({
        to: `/c/$gameInstanceId`,
        params: { gameInstanceId: instanceData[0].id },
      });
  }

  const handleStartGame = async (e: React.MouseEvent<HTMLElement>) => {
    if (!selectedGame) return;
    e.preventDefault();
    const newGame = await createGameAsync({
      gameId: selectedGame,
    });
    if (newGame) {
      navigate({
        to: `/c/$gameInstanceId`,
        params: { gameInstanceId: newGame[0].id },
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
                  'cursor-pointer px-2 py-1 rounded-sm',
                  selectedGame === g.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
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

const SelectAndStart = () => {
  const auth = useSupabaseAuth();
  if (!auth.user) return null;
  return <SelectAndStartInner userId={auth.user.id} />;
};

export default SelectAndStart;
