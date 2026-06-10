import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  getAnswersByQuestionIdQueryOptions,
  useGetAnswersByQuestionId,
} from '@/hooks/useanswerqueries';
import { useInsertEvent } from '@/hooks/useeventqueries';
import useFeudEvents from '@/hooks/useFeudEvents';
import { GameActions } from '@/types';

const AnswerButtons = ({
  instanceId,
  questionId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const { answered } = useFeudEvents({ instanceId });
  const insertEvent = useInsertEvent(instanceId);
  const { data, isLoading, isError, error } =
    useGetAnswersByQuestionId(questionId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  if (!data?.length)
    return <div className="h-full p-4">This question has no answers...</div>;

  return (
    <div className="grid grid-cols-2 grid-rows-4 grid-flow-col h-full gap-2">
      {data?.map((item) => (
        <Button
          key={'actionbutton' + item.id}
          disabled={answered[item.id]}
          onClick={() =>
            insertEvent.mutate({
              instanceid: instanceId,
              // team: activeTeam,
              answerid: item.id,
              eventid: GameActions.CorrectAnswer,
              points: item.score,
            })
          }
        >
          {item.answer}
        </Button>
      ))}

      {data &&
        Array.from({ length: 8 - data?.length }, (_e, i) => (
          <Button key={'extrabtn' + i} disabled={true}></Button>
        ))}
    </div>
  );
};

export default AnswerButtons;
