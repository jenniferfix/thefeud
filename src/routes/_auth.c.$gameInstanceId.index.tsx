import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { useFeudEventsContext } from '#/components/providers/FeudEvents';
import { Button } from '#/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInsertEvent } from '@/hooks/useeventqueries';
import {
  getGameInstanceQueryOptions,
  useGetGameInstance,
  useMarkInstanceFinished,
} from '@/hooks/useinstancequeries';
import { GameActions } from '@/types';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId/')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      getGameInstanceQueryOptions(params.gameInstanceId),
    );
  },
  component: () => <Page />,
});

const Page = () => {
  const { gameInstanceId } = Route.useParams();
  const markFinished = useMarkInstanceFinished();
  const {
    data: gameInstance,
    isError,
    error,
    isLoading,
  } = useGetGameInstance(gameInstanceId);
  const navigate = useNavigate();
  const { remainingQuestions } = useFeudEventsContext();

  const insertEvent = useInsertEvent();

  const handleQuestionClick = React.useCallback(
    (questionId: string) => {
      // setCurrentQuestion(value);
      insertEvent.mutate({
        gameInstanceId,
        event: {
          eventid: GameActions.StartQuestion,
          instanceid: gameInstanceId,
          questionid: questionId,
        },
      });
      navigate({
        to: `/c/$gameInstanceId/$questionId`,
        params: { gameInstanceId, questionId },
      });
    },
    [gameInstanceId, insertEvent.mutate, navigate],
  );

  const handleGameOver = React.useCallback(() => {
    insertEvent.mutate({
      gameInstanceId,
      event: {
        eventid: GameActions.GameOver,
        instanceid: gameInstanceId,
      },
    });
    markFinished.mutate({ gameInstanceId });
  }, [gameInstanceId, insertEvent.mutate, markFinished.mutate]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="grow flex flex-col px-2">
      {!remainingQuestions.length && (
        <div className="my-8 flex justify-center ">
          <Button className="w-full md:w-md" onClick={handleGameOver}>
            Show Game Over
          </Button>
        </div>
      )}
      {!gameInstance.game.questions.length && (
        <div className="flex flex-col justify-center items-center ">
          <div className="font-semibold text-xl my-8">
            There are no questions..
          </div>
        </div>
      )}
      {remainingQuestions.length > 0 && (
        <>
          <h3 className="text-xl font-semibold my-4">Select Next Question</h3>
          <ScrollArea className="grow h-1">
            <div
              role="listbox"
              aria-label="Scrollable listbox of games"
              className="flex flex-col gap-2"
            >
              {remainingQuestions
                ?.sort((a, b) => {
                  if (a.position < b.position) return -1;
                  if (a.position > b.position) return 1;
                  return 0;
                })
                .map((gameQuestion) => (
                  <Button
                    key={gameQuestion.question.id}
                    onClick={() =>
                      handleQuestionClick(gameQuestion.question.id)
                    }
                    className={cn(
                      'cursor-pointer px-2 py-2  rounded-sm',
                      'hover:bg-muted',
                    )}
                  >
                    {gameQuestion.question.question}
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};
