import React from 'react';
import { cn } from '@/lib/utils';

const url = import.meta.env.VITE_PUBLIC_URL;

export type GameboardIframeProps = {
  joinCode: string;
} & React.ComponentProps<'iframe'>;

export const GameboardIframe = React.memo(
  ({ joinCode, className, ...props }: GameboardIframeProps) => {
    return (
      <iframe
        className={cn('', className)}
        title="Game"
        src={`${url}/watch/${joinCode}?isiframe=true`}
        {...props}
      />
    );
  },
);
