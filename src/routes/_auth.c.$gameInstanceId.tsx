import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import Confetti from 'react-confetti';
import { GameboardIframe } from '#/components/GameboardIframe';
// import React from 'react';
import { ShowJoinCode } from '#/components/gamecontrol/ShowJoinCode';
import {
  FeudEventsProvider,
  useFeudEventsContext,
} from '#/components/providers/FeudEvents';
import { getEventsForGameInstanceQueryOptions } from '#/hooks/useeventqueries';
import { useMediaQuery } from '#/hooks/useMediaQuery';
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
//import { useInsertEvent,getEventsForGameInstanceQueryOptions } from '@/hooks/useeventqueries';
import {
  getGameInstanceQueryOptions,
  useGetGameInstance,
} from '@/hooks/useinstancequeries';
import useSupabase from '@/hooks/useSupabase';
//import { GameActions } from '@/types';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId')({
  loader: async ({ context: { queryClient }, params: { gameInstanceId } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getGameInstanceQueryOptions(gameInstanceId)),
      queryClient.ensureQueryData(
        getEventsForGameInstanceQueryOptions(gameInstanceId),
      ),
    ]);
  },
  component: Component,
});

function Component() {
  const { gameInstanceId } = Route.useParams();
  return (
    <FeudEventsProvider instanceId={gameInstanceId} sound={false}>
      <ControlComponent />
    </FeudEventsProvider>
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
}: {
  confetti?: boolean;
  score: number;
  className?: string;
  teamName: string;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  // console.log(confetti, score, teamName);
  return (
    <div className={cn('flex flex-col relative', className)} ref={ref}>
      {confetti && (
        <Confetti
          width={ref.current?.clientWidth}
          height={ref.current?.clientHeight}
          numberOfPieces={30}
        />
      )}
      <div>{teamName}</div>
      <Score className={className} score={score} />
    </div>
  );
};

const MaybeGameboard = ({
  instanceId,
  children,
}: {
  instanceId: string;
  children: React.ReactNode;
}) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  if (isMobile) return children;
  return (
    <div className="flex grow h-full">
      <div>{children}</div>
      <div className="grow relative flex items-center justify-center">
        <div className="h-100 aspect-video border-4 rounded-4xl border-feud-dark-orange overflow-hidden">
          <GameboardIframe instanceId={instanceId} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

function ControlComponent() {
  const { gameInstanceId } = Route.useParams();
  //const insertEvent = useInsertEvent();
  // const [activeTeam, setActiveTeam] = React.useState<number | null | undefined>(
  //   null,
  // );
  const { data: gameInstance } = useGetGameInstance(gameInstanceId);
  const supabaseClient = useSupabase();
  //const navigate = useNavigate();

  const thisGameActions = supabaseClient.channel(gameInstanceId);

  const { strikes, leftTeamScore, rightTeamScore, roundScore, confettiMode } =
    useFeudEventsContext();

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

  const handleSendSound = (sound: string) => {
    thisGameActions.send({
      type: 'broadcast',
      event: 'sound',
      payload: { sound },
    });
  };

  return (
    <MaybeGameboard instanceId={gameInstanceId}>
      <div className="mx-auto relative flex flex-col h-full max-w-lg pb-2 px-2">
        <div className="absolute top-2 right-2">
          <ShowJoinCode
            gameInstanceId={gameInstanceId}
            joinCode={gameInstance.join_code}
          />
        </div>
        <h2 className="flex justify-center text-2xl py-2 border-b">
          {gameInstance?.game?.name}
        </h2>
        <aside className="flex flex-col gap-2 border-b py-2">
          <div className="flex align-middle">
            <TeamScore
              confetti={confettiMode === 'left'}
              teamName={gameInstance.team_left ?? ''}
              score={leftTeamScore}
              className="grow text-left mx-2"
            />
            <div className="shrink">
              <Score className="flex justify-center" score={roundScore} />
              <Strikes className="self-center" strikes={strikes} />
            </div>
            <TeamScore
              confetti={confettiMode === 'right'}
              teamName={gameInstance.team_right ?? ''}
              score={rightTeamScore}
              className="grow text-right"
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
