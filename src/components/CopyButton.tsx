import { CircleCheck, Copy } from 'lucide-react';
import React from 'react';
import { useCopyToClipboard } from '#/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const CopyButton = ({
  copyValue,
  tooltip = 'Click to copy content',
  ...props
}: { copyValue?: string | null; tooltip?: string } & React.ComponentProps<
  typeof Button
>) => {
  const { copy, isCopied } = useCopyToClipboard();

  const handleClick = React.useCallback(() => {
    if (!copyValue) return;
    copy(copyValue);
  }, [copyValue, copy]);

  return (
    <Tooltip>
      <TooltipContent>{tooltip}</TooltipContent>
      <TooltipTrigger asChild>
        <span>
          <Button
            size="icon"
            variant="ghost"
            disabled={!copyValue}
            onClick={handleClick}
            {...props}
          >
            {isCopied ? <CircleCheck /> : <Copy />}
          </Button>
        </span>
      </TooltipTrigger>
    </Tooltip>
  );
};
