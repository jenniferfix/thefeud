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
import { GameActions, Teams } from '@/types';
import { useFeudEventsContext } from '../providers/FeudEvents';
import { HoldButton } from '../ui/holdbutton';

const SelectWinner = ({
  instanceId: gameInstanceId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const insertEvent = useInsertEvent();
  const navigate = useNavigate();
  const { rightName, leftName, currentQuestionId } = useFeudEventsContext();

  const handleRoundWinner = async (team: number) => {
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
    navigate({
      to: `/c/$gameInstanceId`,
      params: { gameInstanceId },
    });
  };

  return (
    <div className="flex gap-2">
      <HoldButton
        className="grow"
        onActivate={async () => await handleRoundWinner(Teams.Left)}
      >
        {leftName}
      </HoldButton>
      <HoldButton
        className="grow"
        onActivate={async () => await handleRoundWinner(Teams.Right)}
      >
        {rightName}
      </HoldButton>
    </div>
  );
};

export default SelectWinner;
