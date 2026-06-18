import { RefreshCcw, UserRound } from 'lucide-react';
import React from 'react';
import { useCreateJoinCode } from '#/hooks/usejoincodes';
// import { useMediaQuery } from '#/hooks/useMediaQuery';
import { useAuthenticatedUser } from '#/supabaseauth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CopyButton } from '../CopyButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { WaitButton } from '../ui/wait-button';

export interface ShowJoinCodeProps {
  gameInstanceId: string;
  joinCode?: string | null;
}

const RefreshCode = ({ gameInstanceId }: ShowJoinCodeProps) => {
  const { user } = useAuthenticatedUser();
  const createCode = useCreateJoinCode();

  const handleRefresh = React.useCallback(async () => {
    await createCode.mutateAsync({ userId: user.id, gameInstanceId });
  }, []);
  const loading = createCode.isPending;
  const disabled = createCode.isPending || createCode.isError;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <WaitButton
            loading={loading}
            disabled={disabled}
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
          >
            <RefreshCcw />
          </WaitButton>
        </span>
      </TooltipTrigger>
      <TooltipContent>Refresh Code</TooltipContent>
    </Tooltip>
  );
};

export const ShowJoinCode = ({
  gameInstanceId,
  joinCode,
}: ShowJoinCodeProps) => {
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
            <RefreshCode gameInstanceId={gameInstanceId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
