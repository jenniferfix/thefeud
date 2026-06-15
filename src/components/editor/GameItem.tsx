import { Link } from '@tanstack/react-router';
import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useDeleteGame } from '#/hooks/usegamequeries';
import type { GameType } from '#/lib/schemas/game';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { ConfirmDialog } from '../ConfirmDialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { WaitButton } from '../ui/wait-button';

export const GameItem = ({ id, name, questions }: GameType) => {
  const deleteGame = useDeleteGame();

  const handleDelete = React.useCallback(async () => {
    await deleteGame.mutateAsync({ gameId: id });
  }, []);

  return (
    <Item className="bg-feudblue/25 border border-feud-lightblue rounded-4xl my-2 sm:my-6">
      <ItemContent className="sm:p-2">
        <ItemTitle className="text-base w-full">
          <Link to="/games/$gameId" params={{ gameId: id }} className="grow">
            {name}
          </Link>
        </ItemTitle>
        <ItemDescription className="flex flex-wrap gap-0.5 sm:gap-1">
          {questions.map((q) => (
            <span
              key={q.id}
              className="text-xs bg-feud-lightblue/25 rounded-lg px-1 py-0.5"
            >
              {q.question}
            </span>
          ))}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ConfirmDialog
          title="Are you sure"
          message={`This will permanently delete ${name}`}
          onConfirm={handleDelete}
        >
          <WaitButton
            loading={deleteGame.isPending}
            disabled={deleteGame.isPending || deleteGame.isError}
            variant="ghost"
            size="icon"
            type="button"
          >
            <TrashIcon />
          </WaitButton>
        </ConfirmDialog>
      </ItemActions>
    </Item>
  );
};
