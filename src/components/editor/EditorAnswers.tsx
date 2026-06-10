import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useRouter } from '@tanstack/react-router';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Waiting } from '@/components/ui/waiting';
import { WarningDialog } from '@/components/ui/warning';
import {
  getAnswersByQuestionIdQueryOptions,
  useDeleteAnswer,
  useGetAnswersByQuestionId,
  useInsertAnswer,
  useUpdateAnswerMutation,
} from '@/hooks/useanswerqueries';
import { getQuestionQueryOptions } from '@/hooks/usequestionqueries';
import type { Tables } from '@/types/supabase.types';
import { cn } from '@/utils/utils';

type AnswerRow = Tables<'answers'>;

const answerSchema = z.object({
  answer: z.string(),
  score: z.coerce.number().int().min(0).max(100),
});

const Answer = ({
  add,
  answer,
  questionid,
}: {
  add?: boolean;
  answer?: AnswerRow;
  questionid: string;
}) => {
  const deleteAnswer = useDeleteAnswer();
  const insertAnswer = useInsertAnswer();
  const updateAnswer = useUpdateAnswerMutation();

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    values: {
      answer: answer?.answer ?? '',
      score: answer?.score ?? 0,
    },
  });

  const handleDelete = () => {
    deleteAnswer.mutate({ id: answer?.id! });
  };

  const handleFormSubmit = (values: z.infer<typeof answerSchema>) => {
    if (!form.formState.isDirty) return;
    if (add) {
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
        className={cn('w-full flex items-center gap-2', add && 'pb-4')}
      >
        <FormField
          control={form.control}
          name={'answer'}
          render={({ field }) => (
            <FormItem
              className={cn(
                'grow',
                (add && insertAnswer.isPending) ||
                  (updateAnswer.isPending && 'animate-pulse'),
              )}
            >
              <FormControl>
                <Input variant="list" placeholder="Answer..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'score'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant="list"
                  size={2}
                  maxLength={3}
                  className=""
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {!answer ? (
          <Button size="icon" variant="ghost" type="submit">
            <PlusIcon />
          </Button>
        ) : (
          <WarningDialog onClick={handleDelete}>
            <Button
              size="icon"
              variant="ghost"
              disabled={deleteAnswer.isPending}
            >
              {deleteAnswer.isPending ? <Waiting /> : <TrashIcon />}
            </Button>
          </WarningDialog>
        )}
      </form>
    </Form>
  );
};

const HeaderSection = () => {
  const params = useParams({
    from: '/_navbar-layout/_auth/e/questions/$questionId',
  });
  const {
    history: { back },
  } = useRouter();
  const questionId = params.questionId;
  const questionQuery = useSuspenseQuery(getQuestionQueryOptions(questionId));
  const question = questionQuery.data;

  return (
    <div className="flex justify-between items-center border-b border-b-foreground/10 px-2 py-1">
      <div>{question?.question}</div>

      <Button variant="outline" size="icon" onClick={() => back()}>
        <ArrowLeftIcon />
      </Button>
    </div>
  );
};

const Answers = () => {
  const params = useParams({
    from: '/_navbar-layout/_auth/e/questions/$questionId',
  });
  const questionId = params.questionId;
  const answerQuery = useSuspenseQuery(
    getAnswersByQuestionIdQueryOptions(questionId),
  );
  const answers = answerQuery.data;

  return (
    <div className="flex flex-col justify-between h-full gap-2 ">
      <HeaderSection />
      <ScrollArea className="flex flex-col justify-start h-full px-2">
        {answers?.map((a) => (
          <Answer key={a.id} questionid={questionId} answer={a} />
        ))}
      </ScrollArea>
      <div className="px-2">
        {answers && answers.length < 8 ? (
          <Answer questionid={questionId} add />
        ) : (
          <div>Only 8 answers</div>
        )}
      </div>
    </div>
  );
};

export default Answers;
