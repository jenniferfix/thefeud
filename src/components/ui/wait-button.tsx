import type React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/utils';

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

export const WaitButton = ({
  loading = false,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      aria-busy={loading || undefined}
      className={cn('grid grid-cols-1 grid-rows-1', className)}
      disabled={disabled || loading}
    >
      <span
        aria-hidden={!loading}
        className={cn(
          'row-span-full col-span-full flex justify-center',
          loading ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Spinner />
      </span>
      <span
        aria-hidden={loading}
        className={cn(
          'row-span-full col-span-full flex justify-center',
          loading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {children}
      </span>
    </Button>
  );
};
