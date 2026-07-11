import { Link } from '@tanstack/react-router';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button, buttonVariants } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ShowJoinCode } from './ShowJoinCode';

export const Config = ({ joinCode }: { joinCode?: string | null }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open game menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Game menu</SheetTitle>
          <SheetDescription>Navigation and sharing controls</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4">
          <Link
            to="/games"
            className={buttonVariants({
              variant: 'outline',
              className: 'w-full',
            })}
          >
            <ArrowLeft /> Back to games
          </Link>
          <ShowJoinCode joinCode={joinCode} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
