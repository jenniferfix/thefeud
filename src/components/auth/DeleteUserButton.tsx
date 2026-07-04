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
} from '#/components/ui/alert-dialog';
import { Button } from '#/components/ui/button';
import { Spinner } from '#/components/ui/spinner';
import { useDeleteUser } from '#/hooks/useAuthQueries';

export const DeleteUserButton = () => {
  const [open, setOpen] = React.useState(false);
  const deleteUserMutation = useDeleteUser();

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (deleteUserMutation.isPending && !nextOpen) return;
      deleteUserMutation.reset();
      setOpen(nextOpen);
    },
    [deleteUserMutation],
  );

  const handleDeleteUser = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        await deleteUserMutation.mutateAsync();
        setOpen(false);
      } catch {
        // The mutation keeps the dialog open and owns error feedback.
      }
    },
    [deleteUserMutation],
  );

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (deleteUserMutation.isPending) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, games, questions, answers,
            and active game links. This action cannot be undone or recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUserMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUserMutation.isPending}
            aria-busy={deleteUserMutation.isPending || undefined}
            onClick={handleDeleteUser}
          >
            {deleteUserMutation.isPending ? (
              <>
                <Spinner aria-hidden="true" />
                Deleting…
              </>
            ) : (
              'Delete account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
