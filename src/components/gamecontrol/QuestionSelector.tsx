import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInsertEvent } from '@/hooks/useeventqueries';
import {
  getGameQuestionsQueryOptions,
  useGetGameQuestions,
} from '@/hooks/usegamequeries';
import { GameActions } from '@/types';
import { cn } from '@/utils/utils';
import { Button } from '../ui/button';

const QuestionSelector = ({
  instanceId,
  gameId,
}: {
  instanceId: string;
  gameId: string;
}) => {
  const navigate = useNavigate();
  const insertEvent = useInsertEvent(instanceId);
  const { data, isLoading, isError, error } = useSuspenseQuery(
    getGameQuestionsQueryOptions(gameId),
  );
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const handleQuestionClick = (questionId: string) => {
    // setCurrentQuestion(value);
    insertEvent.mutate({
      eventid: GameActions.StartQuestion,
      instanceid: instanceId,
      questionid: questionId,
    });
    navigate({
      to: `/c/$gameInstanceId/$questionId`,
      params: { gameInstanceId: instanceId, questionId },
    });
  };

  return (
    <ScrollArea className="grow h-full">
      <div
        role="listbox"
        aria-label="Scrollable listbox of games"
        className="h-full"
      >
        {!data?.questions.length && (
          <div className="flex flex-col justify-center items-center ">
            <div className="font-semibold text-xl my-8">
              There are no questions..
            </div>
            <Button variant="ghost" asChild>
              <Link to="/e/games/$gameId" params={{ gameId }} className="">
                Return to editor
                <ExternalLink className="ml-4 text-muted-foreground size-4" />
              </Link>
            </Button>
          </div>
        )}
        {data?.questions?.map((question) => (
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

export default QuestionSelector;
