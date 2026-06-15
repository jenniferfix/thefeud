import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInsertEvent } from '@/hooks/useeventqueries';
import {
  getInstanceGameQueryOptions,
  useGetInstanceGame,
} from '@/hooks/useinstancequeries';
import { GameActions } from '@/types';
import { cn } from '@/utils/utils';

export const Route = createFileRoute('/_auth/c/$gameInstanceId/')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      getInstanceGameQueryOptions(params.gameInstanceId),
    );
  },
  component: () => <Page />,
});

const Page = () => {
  const { gameInstanceId } = Route.useParams();
  const { data, isError, error, isLoading } =
    useGetInstanceGame(gameInstanceId);
  const navigate = useNavigate();

  const insertEvent = useInsertEvent();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const handleQuestionClick = (questionId: string) => {
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
  };

  return (
    <ScrollArea className="grow h-full">
      <div
        role="listbox"
        aria-label="Scrollable listbox of games"
        className="h-full"
      >
        {!data.games.questions.length && (
          <div className="flex flex-col justify-center items-center ">
            <div className="font-semibold text-xl my-8">
              There are no questions..
            </div>
          </div>
        )}
        {data.games.questions?.map((question) => (
          <div
            key={question.id}
            onClick={() => handleQuestionClick(question.id)}
            className={cn(
              'cursor-pointer px-2 py-1 rounded-sm',
              'hover:bg-muted',
            )}
          >
            {question.question}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
