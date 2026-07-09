import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { useGameControlContext } from '#/components/providers/GameControl';
import { Button, buttonVariants } from '#/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProcessEvent } from '@/hooks/useeventqueries';
import { useGetGameInstance } from '@/hooks/useinstancequeries';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId/')({
  component: () => <Page />,
});

const Page = () => {
  const { gameInstanceId } = Route.useParams();
  const {
    data: gameInstance,
    isError,
    error,
    isLoading,
  } = useGetGameInstance(gameInstanceId);
  const navigate = useNavigate();
  const { remainingQuestions, state } = useGameControlContext();

  const processEvent = useProcessEvent();

  const handleQuestionClick = React.useCallback(
    async (questionId: string) => {
      // setCurrentQuestion(value);
      // await insertEvent.mutateAsync({
      //   gameInstanceId,
      //   event: {
      //     eventid: GameActions.StartQuestion,
      //     instanceid: gameInstanceId,
      //     questionid: questionId,
      //   },
      // });
      await processEvent.mutateAsync({
        gameInstanceId,
        type: 'StartQuestion',
        data: {
          questionId,
        },
      });
      navigate({
        to: `/c/$gameInstanceId/$questionId`,
        params: { gameInstanceId, questionId },
      });
    },
    [gameInstanceId, processEvent.mutateAsync, navigate],
  );

  const handleGameOver = React.useCallback(() => {
    processEvent.mutate({
      gameInstanceId,
      type: 'GameOver',
      data: {},
    });
  }, [gameInstanceId, processEvent.mutate]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  if (state.gameover) {
    return (
      <div className="grow flex flex-col justify-center items-center px-2">
        <div className="font-semibold text-xl my-8">Game Complete</div>
        <Link
          to="/games"
          className={buttonVariants({
            variant: 'default',
            className: 'w-full max-w-sm',
          })}
        >
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col px-2">
      <div className="my-8 flex justify-center ">
        <Button className="w-full md:w-md" onClick={handleGameOver}>
          End Game
        </Button>
      </div>
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
              {[...remainingQuestions]
                .sort((a, b) => {
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
                    {gameQuestion.question.text}
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};
