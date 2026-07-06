import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import Confetti from 'react-confetti';
import { GameboardIframe } from '#/components/GameboardIframe';
// import React from 'react';
import {
  GameControlProvider,
  useGameControlContext,
} from '#/components/providers/GameControl';
import { useElementSize } from '#/hooks/useElementSize';
import { useMediaQuery } from '#/hooks/useMediaQuery';
import type { GameSound } from '#/lib/schemas/events';
import Strikes from '@/components/gamecontrol/Strikes';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  getGameInstanceQueryOptions,
  useGetGameInstance,
} from '@/hooks/useinstancequeries';
import { useSupabase } from '@/hooks/useSupabase';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId')({
  loader: async ({
    context: { queryClient, supabase },
    params: { gameInstanceId },
  }) => {
    await queryClient.ensureQueryData(
      getGameInstanceQueryOptions(supabase, gameInstanceId),
    );
  },
  component: Component,
});

function Component() {
  const { gameInstanceId } = Route.useParams();
  return (
    <GameControlProvider instanceId={gameInstanceId}>
      <ControlComponent />
    </GameControlProvider>
  );
}

const Score = ({ score, className }: { score: number; className?: string }) => {
  return <div className={cn('text-3xl', className)}>{score}</div>;
};

const TeamScore = ({
  confetti = false,
  score,
  className,
  teamName,
  ...props
}: {
  confetti?: boolean;
  score: number;
  teamName: string;
} & React.ComponentProps<'div'>) => {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  // console.log(confetti, score, teamName);
  return (
    <div
      className={cn('flex flex-col relative overflow-hidden', className)}
      ref={ref}
      {...props}
    >
      {confetti && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={30}
          style={{ width, height }}
        />
      )}
      <div>{teamName}</div>
      <Score className={className} score={score} />
    </div>
  );
};

const MaybeGameboard = ({
  joinCode,
  children,
}: {
  joinCode?: string | null;
  children: React.ReactNode;
}) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Remember the most recent join code so the iframe stays mounted after game
  // over clears `join_code` (the already-loaded iframe keeps updating via
  // realtime). Keeping the code stable lets React reuse the same iframe DOM
  // node instead of reloading it against the now-deleted Redis key.
  const lastCodeRef = React.useRef<string | null>(null);
  if (joinCode) lastCodeRef.current = joinCode;
  const code = joinCode ?? lastCodeRef.current;

  if (isMobile || !code) return children;
  return (
    <div className="flex grow h-full">
      <div>{children}</div>
      <div className="grow relative flex items-center justify-center">
        <div className="h-100 aspect-video border-4 rounded-4xl border-feud-dark-orange overflow-hidden">
          <GameboardIframe joinCode={code} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

function ControlComponent() {
  const { gameInstanceId } = Route.useParams();
  const { data: gameInstance } = useGetGameInstance(gameInstanceId);
  const supabaseClient = useSupabase();
  //const navigate = useNavigate();

  const { state } = useGameControlContext();

  // if (isLoading && isFeudEventsLoading) return <div>Loading...</div>;
  // if (isError) return <div>{error.message}</div>;
  // if (!data) return <div>no data yet</div>;

  // const handleTeamToggle = (value: string) => {
  //   setActiveTeam(parseInt(value));
  // };

  // const handleTeamWin = () => {
  //   if (!activeTeam) return;
  //   insertEvent.mutate({
  //     gameInstanceId,
  //     event: {
  //       eventid: GameActions.TeamWin,
  //       instanceid: gameInstanceId,
  //       team: activeTeam,
  //     },
  //   });
  //   navigate({ to: `/c/$gameInstanceId`, params: { gameInstanceId } });
  // };

  const handleSendSound = React.useCallback(
    async (sound: GameSound) => {
      const channel = supabaseClient.channel(gameInstanceId, {
        config: { private: true },
      });
      try {
        await channel.httpSend('sound', { sound });
      } finally {
        await supabaseClient.removeChannel(channel);
      }
    },
    [gameInstanceId, supabaseClient],
  );

  if (!gameInstance) return <div>Loading...</div>;

  const winner = !state.gameover
    ? null
    : state.leftScore > state.rightScore
      ? 'left'
      : state.rightScore > state.leftScore
        ? 'right'
        : null;

  return (
    <MaybeGameboard joinCode={gameInstance.joinCode}>
      <div className="mx-auto relative flex flex-col h-full max-w-lg pb-2 px-2">
        <h2 className="flex justify-center text-2xl py-2 border-b">
          {gameInstance?.game?.name}
        </h2>
        <aside className="flex flex-col gap-2 border-b py-2">
          <div className="flex align-middle">
            <TeamScore
              confetti={
                state.confettiMode === 'left' || state.confettiMode === 'full'
              }
              teamName={gameInstance.leftTeam ?? ''}
              score={state.leftScore}
              className={cn(
                'grow text-left mx-2 rounded-md',
                winner === 'left' && 'bg-muted',
              )}
            />
            <div className="shrink">
              <Score className="flex justify-center" score={state.roundScore} />
              <Strikes className="self-center" strikes={state.strikes} />
            </div>
            <TeamScore
              confetti={
                state.confettiMode === 'right' || state.confettiMode === 'full'
              }
              teamName={gameInstance.rightTeam ?? ''}
              score={state.rightScore}
              className={cn(
                'grow text-right rounded-md',
                winner === 'right' && 'bg-muted',
              )}
            />
          </div>
        </aside>
        <div className="grow flex flex-col">
          <Outlet />
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full">Sound Effects</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Play Sound Effects</DrawerTitle>
              <DrawerDescription hidden>
                Play sound effects using buttons from here
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col mx-4 gap-2">
              <Button onClick={() => handleSendSound('ding')}>Ding</Button>
              <Button onClick={() => handleSendSound('strike')}>Strike</Button>
              <Button onClick={() => handleSendSound('faceOffMusic')}>
                Face-off Music
              </Button>
              <Button onClick={() => handleSendSound('faceOffBuzzer')}>
                Face-off Buzzer
              </Button>
              <Button onClick={() => handleSendSound('themeMusic')}>
                Theme Music
              </Button>
              <Button onClick={() => handleSendSound('clap')}>Clap</Button>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </MaybeGameboard>
  );
}
