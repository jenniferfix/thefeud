import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { createFileRoute } from '@tanstack/react-router';
import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { ConfirmDialog } from '#/components/ConfirmDialog';
import { NewQuestionDialog } from '#/components/editor/NewQuestionDialog';
import { ButtonGroup } from '#/components/ui/button-group';
import {
  getUserQuestionsQueryOptions,
  useDeleteQuestion,
  useGetUsersQuestions,
} from '#/hooks/usequestionqueries';
import type { QuestionType } from '#/lib/schemas/questions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const Route = createFileRoute('/_navbar-layout/_auth/questions')({
  loader: async ({ context: { queryClient, session } }) => {
    await Promise.allSettled([
      queryClient.ensureQueryData(
        getUserQuestionsQueryOptions(session.user.id),
      ),
    ]);
  },
  component: RouteComponent,
});

interface QuestionListingProps extends QuestionType {
  questionId: string;
}

const QuestionListing = React.memo(
  ({ question, questionId, answers }: QuestionListingProps) => {
    const deleteQuestion = useDeleteQuestion();
    const [open, setOpen] = React.useState(true);

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <article className="grid grid-cols-[auto_1fr] items-start my-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="mr-4 self-center"
                >
                  {open ? <MinusIcon /> : <PlusIcon />}
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent>{open ? 'Close' : 'Expand'}</TooltipContent>
          </Tooltip>
          <div className="flex">
            <h3 className="flex items-center grow text-2xl self-center">
              {question}
            </h3>
            <ButtonGroup className="self-center">
              <Button className="">
                <PencilIcon />
              </Button>
              <ConfirmDialog
                title="Confirm Delete"
                message={
                  <>
                    Are you sure you would like to delete the question:
                    <br />
                    <em className="mt-2">{question}</em>
                  </>
                }
                onConfirm={async () => {
                  await deleteQuestion.mutateAsync({ questionId });
                }}
              >
                <Button className="">
                  <TrashIcon />
                </Button>
              </ConfirmDialog>
            </ButtonGroup>
          </div>
          <div></div>
          <CollapsibleContent className="">
            <Table className="mt-2">
              <TableBody>
                {answers.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>{a.answer}</TableCell>
                    <TableCell align="right">{a.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </article>
      </Collapsible>
    );
  },
);

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data } = useGetUsersQuestions(session.user.id);
  return (
    <main className="p-2">
      <section className="w-full max-w-xl">
        <div className="flex">
          <h2 className="grow text-3xl font-bold my-4 self-center">
            Questions
          </h2>
          <NewQuestionDialog>
            <Button
              variant="outline"
              size="default"
              className="ml-auto self-center"
            >
              Add <PlusIcon />
            </Button>
          </NewQuestionDialog>
        </div>
        <div className="pl-4">
          {data?.map((q, i) => (
            <QuestionListing
              key={i}
              questionId={q.id}
              question={q.question}
              answers={q.answers}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
