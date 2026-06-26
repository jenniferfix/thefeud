import { useSortable } from '@dnd-kit/react/sortable';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { ConfirmDialog } from '#/components/ConfirmDialog';
import { QuestionDialog } from '#/components/editor/QuestionDialog';
import { ButtonGroup } from '#/components/ui/button-group';
import { useDeleteQuestion } from '#/hooks/usequestionqueries';
import type { QuestionType } from '#/lib/schemas/questions';
import { cn } from '#/lib/utils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface QuestionListingProps {
  sortable?: boolean;
  question: QuestionType;
  index: number;
  initialOpen?: boolean;
  showDelete?: boolean;
  deleteQuestion?: (questionId: string) => void | Promise<void>;
}

export const QuestionListing = React.memo(
  ({
    sortable = false,
    index,
    initialOpen = false,
    showDelete = false,
    question,
    deleteQuestion,
  }: QuestionListingProps) => {
    const deleteQuestionCompletely = useDeleteQuestion();
    const [open, setOpen] = React.useState(initialOpen);

    const { ref } = useSortable({
      id: question.id,
      index,
      disabled: !sortable,
      alignment: { y: 'center', x: 'start' },
    });

    const handleDelete = React.useCallback(async () => {
      if (deleteQuestion) {
        await deleteQuestion(question.id);
      } else {
        await deleteQuestionCompletely.mutateAsync({ questionId: question.id });
      }
    }, [deleteQuestion, deleteQuestionCompletely.mutateAsync, question.id]);

    return (
      <Collapsible ref={ref} open={open} onOpenChange={setOpen}>
        <article
          className={cn(
            sortable ? 'cursor-grab' : 'cursor-default',
            'grid grid-cols-[auto_1fr] items-start my-2 sm:my-6 bg-feudblue/25 border border-feud-lightblue rounded-4xl p-2',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="mr-4 mt-1 self-start bg-transparent border border-feud-lightblue rounded-xl"
                >
                  {open ? <MinusIcon /> : <PlusIcon />}
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent>{open ? 'Close' : 'Expand'}</TooltipContent>
          </Tooltip>
          <div className="flex">
            <h3 className="grow text-left text-base md:text-2xl flex">
              {/* <CollapsibleTrigger className="text-left grow"> */}
              {question.question}
              {/* </CollapsibleTrigger> */}
            </h3>
            <ButtonGroup className="self-center">
              <QuestionDialog
                editing
                question={question.question}
                questionId={question.id}
                answers={question.answers}
              >
                <Button size="icon" variant="ghost" className="">
                  <PencilIcon />
                </Button>
              </QuestionDialog>
              {showDelete && (
                <ConfirmDialog
                  title="Confirm Delete"
                  message={
                    <>
                      Are you sure you would like to delete the question:
                      <br />
                      <em className="mt-2">{question.question}</em>
                    </>
                  }
                  onConfirm={handleDelete}
                >
                  <Button size="icon" variant="ghost" className="">
                    <TrashIcon />
                  </Button>
                </ConfirmDialog>
              )}
            </ButtonGroup>
          </div>
          <div></div>
          <CollapsibleContent className="">
            <Table className="mt-2 text-sm md:text-base">
              <TableBody>
                {question.answers.map((a) => (
                  <TableRow key={a.answer}>
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
