import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function WarningDialog({
  children,
  onClick,
  title,
  description,
}: {
  onClick: Function;
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const defaultTitle = 'Are you absolutely sure?';
  const displayTitle = title || defaultTitle;
  const defaultDescription = 'You cannot undo this!';
  const displayDescription = description || defaultDescription;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
          <AlertDialogDescription>{displayDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClick()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
