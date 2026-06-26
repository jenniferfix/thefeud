import { UserRound } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CopyButton } from '../CopyButton';

export interface ShowJoinCodeProps {
  joinCode?: string | null;
}

export const ShowJoinCode = ({ joinCode }: ShowJoinCodeProps) => {
  // const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <UserRound />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Code</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between">
          <div className="text-4xl font-semibold">{joinCode}</div>
          <div className="flex">
            <CopyButton copyValue={joinCode} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
