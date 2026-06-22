import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import AnswerButtons from '@/components/gamecontrol/AnswerButtons';
import SelectWinner from '@/components/gamecontrol/SelectWinner';
import { Button } from '@/components/ui/button';
import {
  getEventsForGameInstanceQueryOptions,
  useInsertEvent,
} from '@/hooks/useeventqueries';
import {
  getGameInstanceQueryOptions,
  useGetGameInstance,
} from '@/hooks/useinstancequeries';
import { GameActions } from '@/types';

export const Route = createFileRoute('/_auth/c/$gameInstanceId/$questionId')({
  loader: async ({ context: { queryClient }, params: { gameInstanceId } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(getGameInstanceQueryOptions(gameInstanceId)),
      queryClient.ensureQueryData(
        getEventsForGameInstanceQueryOptions(gameInstanceId),
      ),
    ]);
  },
  component: Page,
});

function Page() {
  const { gameInstanceId, questionId } = Route.useParams();
  const insertEvent = useInsertEvent();
  const { data } = useGetGameInstance(gameInstanceId);

  const [activeTeam, _setActiveTeam] = React.useState<
    number | null | undefined
  >(null);

  const gameQuestion = React.useMemo(
    () => data.game.questions.find((q) => q.question.id === questionId),
    [data, questionId],
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-2xl flex justify-center py-2">
        {gameQuestion?.question.question}
      </h3>
      <AnswerButtons instanceId={gameInstanceId} questionId={questionId} />
      <Button
        className="w-full"
        onClick={() =>
          insertEvent.mutate({
            gameInstanceId,
            event: {
              team: activeTeam,
              instanceid: gameInstanceId,
              eventid: GameActions.Strike,
            },
          })
        }
      >
        Strike
      </Button>
      <SelectWinner instanceId={gameInstanceId} questionId={questionId} />
    </div>
  );
}
