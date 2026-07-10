import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import Confetti from 'react-confetti';
import { GameboardIframe } from '#/components/GameboardIframe';
import { SoundEffects } from '#/components/gamecontrol/SoundEffects';
import {
  GameControlProvider,
  useGameControlContext,
} from '#/components/providers/GameControl';
import { useElementSize } from '#/hooks/useElementSize';
import { useMediaQuery } from '#/hooks/useMediaQuery';
import Strikes from '@/components/gamecontrol/Strikes';
import { useBroadcastRemoteVolumeOnMount } from '@/components/gamecontrol/VolumeControls';
import {
  getGameInstanceQueryOptions,
  useGetGameInstance,
} from '@/hooks/useinstancequeries';
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
      {children}
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
  const { state } = useGameControlContext();

  // The drawer content only mounts when opened, so send the stored
  // presentation volume from here on page load.
  useBroadcastRemoteVolumeOnMount(gameInstanceId);

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
      <div className="mx-auto relative flex flex-col h-full w-full max-w-md pb-2 px-2">
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
        <SoundEffects gameInstanceId={gameInstanceId} />
      </div>
    </MaybeGameboard>
  );
}
