import type React from 'react';
import { cn } from '#/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const Footer = ({
  className,
  ...props
}: React.ComponentProps<'footer'>) => {
  return (
    <footer className={cn('px-8 py-2', className)} {...props}>
      <Card className="w-full max-w-lg bg-transparent border-none gap-1.5">
        <CardHeader>
          <CardTitle>DISCLAIMER</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs">
            This website is an unofficial fan project and is not affiliated
            with, endorsed by, sponsored by, or approved by Family Feud,
            Fremantle, or any related official entities. All trademarks and
            copyrights belong to their respective owners.
          </div>
        </CardContent>
      </Card>
    </footer>
  );
};
