import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Gamepad2Icon } from 'lucide-react';
import React from 'react';
import { ShowJoinCode } from '#/components/gamecontrol/ShowJoinCode';
import {
  FeudEventsProvider,
  useFeudEventsContext,
} from '#/components/providers/FeudEvents';
import QRCode from '@/components/gamecontrol/QRCode';
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
import { useInsertEvent } from '@/hooks/useeventqueries';
import {
  getInstanceGameQueryOptions,
  useGetInstanceGame,
} from '@/hooks/useinstancequeries';
import useSupabase from '@/hooks/useSupabase';
import { GameActions } from '@/types';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId')({
  loader: async ({ context: { queryClient }, params: { gameInstanceId } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getInstanceGameQueryOptions(gameInstanceId)),
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
  score,
  className,
  teamName,
}: {
  score: number;
  className?: string;
  teamName: string;
}) => {
  return (
    <div className="flex flex-col">
      <div>{teamName}</div>
      <Score className={className} score={score} />
    </div>
  );
};

function ControlComponent() {
  const { gameInstanceId } = Route.useParams();
  const insertEvent = useInsertEvent();
  const [activeTeam, setActiveTeam] = React.useState<number | null | undefined>(
    null,
  );
  const {
    data: instanceQueryData,
    isLoading: isInstanceQueryLoading,
    isError: isInstanceQueryError,
    error: instanceQueryError,
  } = useGetInstanceGame(gameInstanceId);
  const supabaseClient = useSupabase();
  const navigate = useNavigate();

  const thisGameActions = supabaseClient.channel(gameInstanceId);

  const {
    isLoading: isFeudEventsLoading,
    currentQuestion,
    strikes,
    leftTeamScore,
    rightTeamScore,
    roundScore,
  } = useFeudEventsContext();

  // if (isLoading && isFeudEventsLoading) return <div>Loading...</div>;
  // if (isError) return <div>{error.message}</div>;
  // if (!data) return <div>no data yet</div>;

  const handleTeamToggle = (value: string) => {
    setActiveTeam(parseInt(value));
  };

  const handleTeamWin = () => {
    if (!activeTeam) return;
    insertEvent.mutate({
      gameInstanceId,
      event: {
        eventid: GameActions.TeamWin,
        instanceid: gameInstanceId,
        team: activeTeam,
      },
    });
    navigate({ to: `/c/$gameInstanceId`, params: { gameInstanceId } });
  };

  const handleSendSound = (sound: string) => {
    thisGameActions.send({
      type: 'broadcast',
      event: 'sound',
      payload: { sound },
    });
  };

  return (
    <div className="mx-auto relative flex flex-col h-full max-w-lg pb-2 px-2">
      <div className="absolute top-2 right-2">
        <ShowJoinCode
          gameInstanceId={gameInstanceId}
          joinCode={instanceQueryData.join_code}
        />
        <QRCode instanceId={gameInstanceId} />
      </div>
      <h2 className="flex justify-center text-2xl py-2 border-b">
        {instanceQueryData?.games?.name}
      </h2>
      <aside className="flex flex-col gap-2 border-b py-2">
        <Score className="flex justify-center" score={roundScore} />
        <div className="flex justify-between align-middle">
          <TeamScore
            teamName={instanceQueryData.team_left ?? ''}
            score={leftTeamScore}
            className="text-left mx-2"
          />
          <Strikes className="self-center" strikes={strikes} />
          <TeamScore
            teamName={instanceQueryData.team_right ?? ''}
            score={rightTeamScore}
            className="text-right"
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
  );
}
