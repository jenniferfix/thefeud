'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { Gamepad2Icon } from 'lucide-react';
import React from 'react';
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
import useFeudEvents from '@/hooks/useFeudEvents';
import { useGetGameQuestions } from '@/hooks/usegamequeries';
import {
  getInstanceGameQueryOptions,
  useGetInstanceGame,
} from '@/hooks/useinstancequeries';
import useSupabase from '@/hooks/useSupabase';
import { GameActions } from '@/types';
import { cn } from '@/utils/utils';

const GameControl = ({
  instanceId,
  gameId,
}: {
  instanceId: string;
  gameId: string;
}) => {
  const insertEvent = useInsertEvent(instanceId);
  const [activeTeam, setActiveTeam] = React.useState<number | null | undefined>(
    null,
  );
  const { data, isLoading, isError, error } = useGetGameQuestions(gameId);
  const {
    data: instanceQueryData,
    isLoading: isInstanceQueryLoading,
    isError: isInstanceQueryError,
    error: instanceQueryError,
  } = useSuspenseQuery(getInstanceGameQueryOptions(instanceId));
  const supabaseClient = useSupabase();
  const navigate = useNavigate();

  const thisGameActions = supabaseClient.channel(instanceId);

  const {
    isLoading: isFeudEventsLoading,
    currentQuestion,
    strikes,
    leftTeamScore,
    rightTeamScore,
    roundScore,
  } = useFeudEvents({
    instanceId,
    sound: false,
  });

  if (isLoading && isFeudEventsLoading) return <div>Loading...</div>;
  if (isError) return <div>{error.message}</div>;
  if (!data) return <div>no data yet</div>;

  const handleTeamToggle = (value: string) => {
    setActiveTeam(parseInt(value));
  };

  const handleTeamWin = () => {
    if (!activeTeam) return;
    insertEvent.mutate({
      eventid: GameActions.TeamWin,
      instanceid: instanceId,
      team: activeTeam,
    });
    navigate({ to: `/c/${instanceId}` });
  };

  const handleSendSound = (sound: string) => {
    thisGameActions.send({
      type: 'broadcast',
      event: 'sound',
      payload: { sound },
    });
  };

  const Score = ({
    score,
    className,
  }: {
    score: number;
    className?: string;
  }) => {
    return <div className={cn('px-6 py-1 text-3xl', className)}>{score}</div>;
  };

  return (
    <div className="relative flex flex-col justify-between min-h-screen max-w-lg mx-auto pb-2 px-2">
      <div className="absolute top-2 right-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate({ to: `/c` })}
        >
          <Gamepad2Icon />
        </Button>
        <QRCode instanceId={instanceId} />
      </div>
      <h2 className="flex justify-center text-2xl py-2 border-b">
        {instanceQueryData?.games?.name}
      </h2>
      <aside className="flex flex-col gap-2 border-b py-2">
        <Score className="flex justify-center" score={roundScore} />
        <div className="flex justify-between align-middle">
          <Score score={leftTeamScore} />
          <Strikes className="self-center" strikes={strikes} />
          <Score score={rightTeamScore} />
        </div>
      </aside>
      <div className="grow">
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
};

export default GameControl;
