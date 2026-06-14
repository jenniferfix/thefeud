import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
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
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { GameDialog } from './GameDialog';
import { QuestionDialog } from './QuestionDialog';
import { QuestionListing } from './QuestionListing';

export const GameItem = ({ id, name, questions }: GameType) => {
  const [open, setOpen] = React.useState(true);

  return (
    <Item className="bg-feudblue/25 border border-feud-lightblue rounded-4xl my-2 sm:my-4">
      <ItemContent>
        <ItemTitle className="text-base">{name}</ItemTitle>
        <ItemDescription>
          {questions.map((q) => (
            <span key={q.id} className="text-xs">
              {q.question}
            </span>
          ))}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <GameDialog gameId={id} name={name} edit>
          <Button variant="ghost" size="icon-sm">
            <PencilIcon />
          </Button>
        </GameDialog>
      </ItemActions>
    </Item>
  );
};
