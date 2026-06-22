import { useNavigate } from '@tanstack/react-router';
import React from 'react';
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
import { useFeudEventsContext } from '../providers/FeudEvents';

const SelectWinner = ({
  instanceId: gameInstanceId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const insertEvent = useInsertEvent();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = React.useState(false);
  const { rightName, leftName, currentQuestionId } = useFeudEventsContext();

  React.useEffect(() => {
    const handleDocClick = () => {
      if (!showConfetti) return;
      setShowConfetti(false);
      navigate({
        to: `/c/$gameInstanceId`,
        params: { gameInstanceId },
      });
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [gameInstanceId, showConfetti, navigate]);

  const handleTeamWin = async (team: number) => {
    await Promise.all([
      insertEvent.mutateAsync({
        gameInstanceId,
        event: {
          eventid: GameActions.RoundWin,
          instanceid: gameInstanceId,
          team: team,
          questionid: currentQuestionId,
        },
      }),
    ]);
    setShowConfetti(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select round winner</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>Select Winner</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await handleTeamWin(1)}>
          {leftName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => await handleTeamWin(2)}>
          {rightName}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SelectWinner;
