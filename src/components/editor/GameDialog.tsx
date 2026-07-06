import React from 'react';
import { useInsertGame, useUpdateGame } from '#/hooks/usegamequeries';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppForm } from '../ui/tanstack-form';

export type GameDialogProps = {
  children?: React.ReactNode;
  edit?: boolean;
  name?: string;
  gameId?: string;
};

export const GameDialog = ({
  children,
  edit,
  name,
  gameId,
}: GameDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const insertGame = useInsertGame();
  const updateGame = useUpdateGame();

  const form = useAppForm({
    defaultValues: {
      name: name ?? '',
    },
    validators: {},
    onSubmit: async ({ formApi, value }) => {
      if (!edit) {
        await insertGame.mutateAsync({ name: value.name });
      } else {
        if (!gameId) throw Error('Must provide gameId if edit is true');
        await updateGame.mutateAsync({
          gameId,
          name: value.name,
        });
      }
      formApi.reset();
      setOpen(false);
    },
  });

  const handleSubmit = React.useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{edit ? `Edit Game` : `New Game`}</DialogTitle>
          <DialogDescription>
            {edit ? 'Update game settings' : 'Create new game'}
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <form.AppField
              name="name"
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>Name</field.FieldLabel>
                  <field.InputGroup>
                    <field.InputGroupInput
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Your awesome game"
                    />
                  </field.InputGroup>
                </field.Field>
              )}
            />
            <DialogFooter className="gap-3 mt-2">
              <DialogClose asChild>
                <form.Button
                  type="button"
                  className="grow"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Cancel
                </form.Button>
              </DialogClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <form.WaitButton
                    variant="default"
                    className="grow"
                    disabled={!canSubmit && !isSubmitting}
                    loading={isSubmitting}
                  >
                    {edit ? 'Update' : 'Add'}
                  </form.WaitButton>
                )}
              />
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
