import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import Confetti from 'react-confetti';
import {
  useGetInstanceGame,
  useMarkInstanceFinished,
} from '#/hooks/useinstancequeries';
import { useWindowSize } from '#/hooks/useWindowSize';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInsertEvent } from '@/hooks/useeventqueries';
import { GameActions } from '@/types';

const SelectWinner = ({
  instanceId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const insertEvent = useInsertEvent();
  const markFinished = useMarkInstanceFinished();
  const navigate = useNavigate();
  const { data } = useGetInstanceGame(instanceId);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    const handleDocClick = () => {
      if (!showConfetti) return;
      setShowConfetti(false);
      navigate({
        to: `/c/$gameInstanceId`,
        params: { gameInstanceId: instanceId },
      });
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [showConfetti, navigate]);

  const handleTeamWin = async (team: number) => {
    await Promise.all([
      insertEvent.mutateAsync({
        gameInstanceId: instanceId,
        event: {
          eventid: GameActions.TeamWin,
          instanceid: instanceId,
          team: team,
        },
      }),
      markFinished.mutateAsync({ gameInstanceId: instanceId }),
    ]);
    setShowConfetti(true);
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Select round winner</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="">
          <DropdownMenuLabel>Select Winner</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={async () => await handleTeamWin(1)}>
            {data.team_left}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={async () => await handleTeamWin(2)}>
            {data.team_right}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SelectWinner;
