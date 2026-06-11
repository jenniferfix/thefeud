import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Waiting } from '@/components/ui/waiting';
import { WarningDialog } from '@/components/ui/warning';
import {
  useDeleteAnswer,
  useGetAnswersByQuestionId,
  useInsertAnswer,
  useUpdateAnswer,
} from '@/hooks/useanswerqueries';
import { deleteQuestion } from '@/queries/questionqueries';
import type { Tables } from '@/types/supabase.types';

type AnswerRow = Tables<'answers'>;

const answerSchema = z.object({
  answer: z.string(),
  score: z.coerce.number().int().min(0).max(100),
});

const Answer = ({
  addAnswer,
  answer,
  questionid,
}: {
  addAnswer?: boolean;
  answer?: AnswerRow;
  questionid: string;
}) => {
  const deleteAnswer = useDeleteAnswer();
  const insertAnswer = useInsertAnswer();
  const updateAnswer = useUpdateAnswer();

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    values: {
      answer: answer?.answer ?? '',
      score: answer?.score ?? 0,
    },
  });

  const handleDelete = (id: string) => {
    deleteAnswer.mutate({ id });
  };

  const handleFormSubmit = (values: z.infer<typeof answerSchema>) => {
    if (!form.formState.isDirty) return;
    if (addAnswer) {
      insertAnswer.mutate({
        answer: values.answer,
        question_id: questionid,
        score: values.score,
      });
    } else {
      updateAnswer.mutate({
        id: answer?.id!,
        data: {
          answer: values.answer,
          score: values.score,
        },
      });
    }
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        onBlur={form.handleSubmit(handleFormSubmit)}
        className="flex w-full gap-1"
      >
        <FormItem className="grow">
          <FormControl>
            <FormField
              control={form.control}
              name={'answer'}
              render={({ field }) => (
                <Input variant="list" placeholder="Answer..." {...field} />
              )}
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormControl>
            <FormField
              control={form.control}
              name={'score'}
              render={({ field }) => (
                <Input variant="list" maxLength={3} size={2} {...field} />
              )}
            />
          </FormControl>
        </FormItem>
        {!answer && (
          <Button size="icon" variant="ghost" type="submit">
            <PlusIcon />
          </Button>
        )}
        {answer && (
          <WarningDialog onClick={() => handleDelete(answer.id)}>
            <Button size="icon" variant="ghost">
              {deleteAnswer.isPending ? <Waiting /> : <TrashIcon />}
            </Button>
          </WarningDialog>
        )}
      </form>
    </Form>
  );
};

const Answers = ({ questionid }: { questionid: string }) => {
  const { isError, data, error, isLoading } =
    useGetAnswersByQuestionId(questionid);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <React.Fragment>
      {data?.map((a) => (
        <Answer
          key={a.id}
          questionid={questionid}
          answer={a}
          addAnswer={false}
        />
      ))}
      {data && data.length < 8 && <Answer questionid={questionid} addAnswer />}
    </React.Fragment>
  );
};

export default Answers;
