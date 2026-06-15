import { useNavigate } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateGameInstance } from '#/hooks/useinstancequeries';
import { Button } from '@/components/ui/button';
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

export type StartGameProps = { gameId: string; name: string };

export const StartGameDialog = ({ gameId, name }: StartGameProps) => {
  const [open, setOpen] = React.useState(false);
  const createGame = useCreateGameInstance();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      teamLeft: 'Lefties',
      teamRight: 'Righties',
    },
    validators: {
      onSubmit: z.object({
        teamLeft: z.string(),
        teamRight: z.string(),
      }),
    },
    onSubmit: async ({ formApi, value: { teamLeft, teamRight } }) => {
      const newGame = await createGame.mutateAsync({
        gameId,
        teamLeft,
        teamRight,
      });
      navigate({
        to: '/c/$gameInstanceId',
        params: { gameInstanceId: newGame.id },
      });
    },
  });

  React.useEffect(() => {
    if (createGame.error) toast(createGame.error.message);
  }, [createGame.error]);

  const handleSubmit = React.useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form.handleSubmit],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Play />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start {name}</DialogTitle>
        </DialogHeader>
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <form.AppField
              name="teamLeft"
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>Left Team</field.FieldLabel>
                  <field.Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.Field>
              )}
            />
            <form.AppField
              name="teamRight"
              children={(field) => (
                <field.Field className="my-2 sm:my-4">
                  <field.FieldLabel>Right Team</field.FieldLabel>
                  <field.Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.Field>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <form.Button type="button" variant="outline">
                  Cancel
                </form.Button>
              </DialogClose>
              <form.WaitButton
                loading={createGame.isPending}
                disabled={createGame.isPending || createGame.isError}
              >
                Start
              </form.WaitButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
