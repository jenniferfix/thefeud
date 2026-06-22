import { generateKeyBetween } from 'fractional-indexing';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Waiting } from '@/components/ui/waiting';
import { useAddQuestionToGame } from '@/hooks/usegamequeries';
import { useGetUsersQuestions } from '@/hooks/usequestionqueries';
import { cn } from '@/utils/utils';
import { QuestionDialog } from './QuestionDialog';

export type AddQuestionToGameProps = {
  gameId: string;
  children: React.ReactNode;
  existingIds?: string[];
  lastPosition?: string | null;
};

export const AddQuestionToGameDialog = ({
  gameId,
  children,
  existingIds,
  lastPosition = null,
}: AddQuestionToGameProps) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const addToGame = useAddQuestionToGame();
  const { data } = useGetUsersQuestions();

  const unused = data?.filter((q) => !existingIds?.includes(q.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selected) return;
    const position = generateKeyBetween(lastPosition, null);
    addToGame.mutate({ gameId, questionId: selected, position });
  };

  React.useEffect(() => {
    if (addToGame.status === 'success') {
      setSelected(null);
      setOpen(false);
      addToGame.reset();
    }
  }, [addToGame.status, addToGame.reset]);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-5/6">
        <DialogHeader>
          <DialogTitle>Select question:</DialogTitle>
          <DialogDescription>
            Select a question to add to the current game
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <ScrollArea className="border min-h-0 h-75">
            <div
              role="listbox"
              aria-label="scrollable, selectable list of questions"
              className="p-1"
            >
              {unused?.map((q) => (
                <div
                  key={q.id}
                  role="option"
                  aria-selected={selected === q.id}
                  onClick={() => setSelected(q.id)}
                  className={cn(
                    'cursor-pointer px-2 py-1',
                    selected === q.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent/50 hover:text-accent-foreground',
                  )}
                >
                  {q.question}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={addToGame.isPending}>
            {addToGame.isPending ? <Waiting /> : 'Add'}
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
