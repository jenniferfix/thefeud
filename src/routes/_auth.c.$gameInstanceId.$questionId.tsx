import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import AnswerButtons from '@/components/gamecontrol/AnswerButtons';
import SelectWinner from '@/components/gamecontrol/SelectWinner';
import { Button } from '@/components/ui/button';
import { useInsertEvent } from '@/hooks/useeventqueries';
import {
  getInstanceGameQueryOptions,
  useGetInstanceGame,
} from '@/hooks/useinstancequeries';
import { GameActions } from '@/types';

export const Route = createFileRoute('/_auth/c/$gameInstanceId/$questionId')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      getInstanceGameQueryOptions(params.gameInstanceId),
    );
  },
  component: Page,
});

function Page() {
  const { gameInstanceId, questionId } = Route.useParams();
  const insertEvent = useInsertEvent();
  const { data, isError, error, isLoading } =
    useGetInstanceGame(gameInstanceId);

  const [activeTeam, setActiveTeam] = React.useState<number | null | undefined>(
    null,
  );

  const question = data.games.questions.find((q) => q.id === questionId);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-2xl flex justify-center py-2">
        {question?.question}
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
