import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Waiting } from '@/components/ui/waiting';
import { WarningDialog } from '@/components/ui/warning';
import {
  getUserQuestionsQueryOptions,
  useDeleteQuestion,
  useInsertQuestion,
  useUpdateQuestion,
} from '@/hooks/usequestionqueries';
// import { useGetUsersQuestions } from '@/hooks/usequestionqueries';
import { useSupabaseAuth } from '@/supabaseauth';
import type { Tables } from '@/types/supabase.types';
import { cn } from '@/utils/utils';

type TQuestionRow = Tables<'questions'>;

const questionSchema = z.object({
  question: z.string(),
});

const Question = ({
  question,
  add,
}: {
  question?: TQuestionRow;
  add?: boolean;
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const deleteQuestion = useDeleteQuestion();
  const updateQuestion = useUpdateQuestion();
  const insertQuestion = useInsertQuestion();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    values: {
      question: question?.question ?? '',
    },
  });

  React.useEffect(() => {
    if (deleteQuestion.status === 'success') {
      navigate({ to: '/e/questions' });
    }
  }, [deleteQuestion.status]);

  const handleDelete = () => {
    deleteQuestion.mutate({ questionId: question?.id! });
  };

  const handleSubmit = (values: z.infer<typeof questionSchema>) => {
    if (!add) return;
    insertQuestion.mutate({ question: values?.question });
    form.reset();
  };

  const handleBlur = (values: z.infer<typeof questionSchema>) => {
    if (add) return;
    if (!form.formState.isDirty) return;
    updateQuestion.mutate({
      questionId: question?.id!,
      question: values.question,
    });
  };

  const handleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onBlur={form.handleSubmit(handleBlur)}
        className={cn('w-full flex items-center gap-2', add && 'pb-4')}
      >
        {isEditing || add ? (
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem className={cn('grow', add ? '' : '')}>
                <FormControl>
                  <Input
                    {...field}
                    variant={'list'}
                    placeholder="Your question goes here..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          <Link
            to={`/e/questions/$questionId`}
            params={{ questionId: question?.id }}
            className="w-full flex items-center pl-2"
            activeProps={{ className: 'font-bold' }}
          >
            {question?.question}
          </Link>
        )}
        {!add ? (
          <React.Fragment>
            <Button size="icon" variant="ghost" onClick={handleEditing}>
              <Pencil1Icon />
            </Button>
            <WarningDialog onClick={handleDelete}>
              <Button size="icon" variant="ghost">
                {deleteQuestion.isPending ? <Waiting /> : <TrashIcon />}
              </Button>
            </WarningDialog>
          </React.Fragment>
        ) : (
          <Button type="submit" size="icon" variant="ghost">
            <PlusIcon />
          </Button>
        )}
      </form>
    </Form>
  );
};

const Questions = () => {
  const auth = useSupabaseAuth();
  const questionsQuery = useSuspenseQuery(
    getUserQuestionsQueryOptions(auth.user?.id!),
  );
  const questions = questionsQuery.data;
  return (
    <section className="flex flex-col justify-between h-full w-full pt-3 px-2">
      <ScrollArea className="flex flex-col justify-start h-full">
        {questions?.map((q) => (
          <Question key={q.id} question={q} />
        ))}
      </ScrollArea>
      <Question add />
    </section>
  );
};

export default Questions;
