import { useGameControlContext } from '@/components/providers/GameControl';
import { Button } from '@/components/ui/button';
import { useGetAnswersByQuestionId } from '@/hooks/useanswerqueries';
import { useProcessEvent } from '@/hooks/useeventqueries';

const AnswerButtons = ({
  instanceId,
  questionId,
}: {
  instanceId: string;
  questionId: string;
}) => {
  const { isAnswered } = useGameControlContext();
  const processEvent = useProcessEvent();
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
          key={`actionbutton${item.id}`}
          disabled={isAnswered(item.id)}
          onClick={() =>
            processEvent.mutate({
              gameInstanceId: instanceId,
              type: 'CorrectAnswer',
              data: { answerId: item.id },
            })
          }
        >
          {item.answer}
        </Button>
      ))}

      {data &&
        Array.from({ length: 8 - data?.length }, (_e, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          <Button key={`extrabtn${i}`} disabled={true}></Button>
        ))}
    </div>
  );
};

export default AnswerButtons;
