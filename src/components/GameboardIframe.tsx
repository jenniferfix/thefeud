import React from 'react';
import { cn } from '@/lib/utils';

const url = import.meta.env.VITE_PUBLIC_URL;

export type GameboardIframeProps = {
  instanceId: string;
} & React.ComponentProps<'iframe'>;

export const GameboardIframe = React.memo(
  ({ instanceId, className, ...props }: GameboardIframeProps) => {
    return (
      <iframe
        className={cn('', className)}
        title="Game"
        src={`${url}/g/${instanceId}?isiframe=true`}
        {...props}
      />
    );
  },
);
