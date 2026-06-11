import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DashIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useParams } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { useRemoveQuestionFromGame } from '@/hooks/usegamequeries';
import {
  useInsertQuestion,
  useUpdateQuestion,
} from '@/hooks/usequestionqueries';
import { Tables } from '@/types/supabase.types';
import Answers from './Answers';

const questionSchema = z.object({
  question: z.string(),
});

const Question = ({
  id,
  text,
  addQuestion,
  editable = false,
  showAnswers = false,
}: {
  id?: string;
  text?: string;
  addQuestion?: boolean;
  editable?: boolean;
  showAnswers?: boolean;
}) => {
  const params = useParams({ from: '/_navbar-layout/_auth/e/games/$gameId' });
  const removeQuestionFromGame = useRemoveQuestionFromGame(params.gameId);
  const updateQuestion = useUpdateQuestion();
  const insertQuestion = useInsertQuestion();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    values: {
      question: text ?? '',
    },
  });

  const handleSubmit = (values: z.infer<typeof questionSchema>) => {
    if (!addQuestion) return;
    insertQuestion.mutate({ question: values?.question });
    form.reset();
  };

  const handleBlur = (values: z.infer<typeof questionSchema>) => {
    if (addQuestion) return;
    if (!form.formState.isDirty) return;
    updateQuestion.mutate({ questionId: id!, question: values.question });
  };

  const handleDelete = () => {
    removeQuestionFromGame.mutate({ questionId: id! });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          onBlur={form.handleSubmit(handleBlur)}
          className="w-full flex items-center gap-1"
        >
          <FormItem className="grow">
            <FormControl>
              <FormField
                control={form.control}
                name={'question'}
                render={({ field }) => (
                  <Input variant="list" placeholder="Question" {...field} />
                )}
              />
            </FormControl>
          </FormItem>
          {!addQuestion ? (
            <React.Fragment>
              <WarningDialog
                title="Are you sure you want to delete this?"
                onClick={handleDelete}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={removeQuestionFromGame.isPending}
                >
                  {removeQuestionFromGame.isPending ? (
                    <Waiting />
                  ) : (
                    <TrashIcon />
                  )}
                </Button>
              </WarningDialog>
              <CollapsibleTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-md">
                  {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
            </React.Fragment>
          ) : (
            <Button type="submit" size="icon" variant="ghost">
              <PlusIcon />
            </Button>
          )}
        </form>
      </Form>
      {!addQuestion && (
        <CollapsibleContent className="pl-4 mt-1">
          {/* <Answers questionid={id!} /> */}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default Question;
