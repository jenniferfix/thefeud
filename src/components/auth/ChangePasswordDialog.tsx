import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useSupabase } from '@/hooks/useSupabase';
import { changePasswordSchema } from '@/types/auth';

export const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const currentPasswordRef = React.useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = useSupabase();

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordVerify: '',
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value: { currentPassword, password } }) => {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        current_password: currentPassword,
        password,
      });

      if (error) {
        setIsLoading(false);
        toast.error(
          error.status === 400
            ? 'The current password is incorrect.'
            : 'Your password could not be changed. Please try again.',
        );
        window.setTimeout(() => {
          currentPasswordRef.current?.focus();
          currentPasswordRef.current?.select();
        });
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'others',
      });
      setIsLoading(false);

      if (signOutError) {
        toast.warning(
          'Password changed, but other sessions could not be signed out.',
        );
      } else {
        toast.success('Password changed');
      }

      form.reset();
      onOpenChange?.(false);
    },
  });

  const handleSubmit = React.useCallback(
    (event: React.SubmitEvent) => {
      event.preventDefault();
      event.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new password between 8
                and 128 characters.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <form.AppField
                name="currentPassword"
                children={(field) => (
                  <field.Field>
                    <field.FieldLabel>Current password</field.FieldLabel>
                    <field.FormPassword
                      ref={currentPasswordRef}
                      autoComplete="current-password"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <field.FieldInfo field={field} />
                  </field.Field>
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.Field>
                    <field.FieldLabel>New password</field.FieldLabel>
                    <field.FormPassword
                      autoComplete="new-password"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <field.FieldInfo field={field} />
                  </field.Field>
                )}
              />
              <form.AppField
                name="passwordVerify"
                children={(field) => (
                  <field.Field>
                    <field.FieldLabel>Confirm new password</field.FieldLabel>
                    <field.FormPassword
                      autoComplete="new-password"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <field.FieldInfo field={field} />
                  </field.Field>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <form.WaitButton loading={isLoading} type="submit">
                Change password
              </form.WaitButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
