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
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface QuestionListingProps extends QuestionType {
  questionId: string;
}

export const QuestionListing = React.memo(
  ({ question, questionId, answers }: QuestionListingProps) => {
    const deleteQuestion = useDeleteQuestion();
    const [open, setOpen] = React.useState(true);

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <article className="grid grid-cols-[auto_1fr] items-start my-6 bg-card/50 border-card rounded-2xl p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="mr-4 self-center bg-transparent"
                >
                  {open ? <MinusIcon /> : <PlusIcon />}
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent>{open ? 'Close' : 'Expand'}</TooltipContent>
          </Tooltip>
          <div className="flex">
            <CollapsibleTrigger className="grow text-left text-2xl">
              {question}
            </CollapsibleTrigger>
            <ButtonGroup className="self-center">
              <QuestionDialog
                editing
                question={question}
                questionId={questionId}
                answers={answers}
              >
                <Button size="icon" variant="ghost" className="">
                  <PencilIcon />
                </Button>
              </QuestionDialog>
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
                <Button size="icon" variant="ghost" className="">
                  <TrashIcon />
                </Button>
              </ConfirmDialog>
            </ButtonGroup>
          </div>
          <div></div>
          <CollapsibleContent className="">
            <Table className="mt-2 max-w-sm">
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
