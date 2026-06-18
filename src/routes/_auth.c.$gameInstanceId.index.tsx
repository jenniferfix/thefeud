import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
    <div className="grow flex flex-col px-2">
      <h3 className="text-xl font-semibold my-4">Select Next Question</h3>
      <ScrollArea className="grow h-1">
        <div
          role="listbox"
          aria-label="Scrollable listbox of games"
          className="flex flex-col gap-2"
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
                'cursor-pointer px-2 py-2  rounded-sm',
                'hover:bg-muted',
              )}
            >
              {question.question}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
