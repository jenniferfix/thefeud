import { useNavigate } from '@tanstack/react-router';
import { useProcessEvent } from '@/hooks/useeventqueries';
import { Teams } from '@/types';
import { useGameControlContext } from '../providers/GameControl';
import { HoldButton } from '../ui/holdbutton';

const SelectWinner = ({
  instanceId: gameInstanceId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const processEvent = useProcessEvent();
  const navigate = useNavigate();
  const { state } = useGameControlContext();

  const handleRoundWinner = async (team: Teams) => {
    await Promise.all([
      processEvent.mutateAsync({
        gameInstanceId,
        type: 'RoundWin',
        data: {
          team: team,
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
        {state.leftTeam}
      </HoldButton>
      <HoldButton
        className="grow"
        onActivate={async () => await handleRoundWinner(Teams.Right)}
      >
        {state.rightTeam}
      </HoldButton>
    </div>
  );
};

export default SelectWinner;
