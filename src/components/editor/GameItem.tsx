import { MinusIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import type { GameType } from '#/lib/schemas/game';
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Button } from '../ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { QuestionListing } from './QuestionListing';

export const GameItem = ({ id, name, questions }: GameType) => {
  const [open, setOpen] = React.useState(true);

  console.log('gameitem', name, questions);
  return (
    <div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="grid grid-cols-[auto_1fr]">
          <CollapsibleTrigger asChild>
            <Button size="icon-xs" variant="ghost" className="mr-4 self-center">
              {open ? <MinusIcon /> : <PlusIcon />}
            </Button>
          </CollapsibleTrigger>
          <h3 className="text-2xl">
            <CollapsibleTrigger>{name}</CollapsibleTrigger>
          </h3>
          <div></div>
          <CollapsibleContent>
            {!questions.length && <div>Nothing here</div>}
            {questions.map((q) => (
              <QuestionListing
                key={q.question}
                id={q.id}
                questionId={q.id}
                question={q.question}
                answers={q.answers}
              />
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
