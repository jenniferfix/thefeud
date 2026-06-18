import { CircleCheck, Copy } from 'lucide-react';
import React from 'react';
import { useCopyToClipboard } from '#/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/button';

export const CopyButton = ({
  copyValue,
  ...props
}: { copyValue?: string | null } & React.ComponentProps<typeof Button>) => {
  const { copy, isCopied } = useCopyToClipboard();
  const [showCheck, setShowCheck] = React.useState(false);

  const handleClick = React.useCallback(() => {
    if (!copyValue) return;
    copy(copyValue);
  }, [copyValue, copy]);

  React.useEffect(() => {
    if (!isCopied) return;
    setShowCheck(true);
    const timeoutId = setTimeout(() => {
      setShowCheck(false);
    }, 3000);
    return () => clearTimeout(timeoutId);
  });

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={!copyValue}
      onClick={handleClick}
      {...props}
    >
      {showCheck ? <CircleCheck /> : <Copy />}
    </Button>
  );
};
