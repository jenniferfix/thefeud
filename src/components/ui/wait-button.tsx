import React from 'react';
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
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      className={cn('grid grid-cols-1 grid-rows-1', className)}
    >
      <span
        className={cn(
          'row-span-full col-span-full flex justify-center',
          loading ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Spinner />
      </span>
      <span
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
