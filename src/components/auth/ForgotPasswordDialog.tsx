import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useSupabase } from '@/hooks/useSupabase';
import { buildAuthCallbackUrl } from '@/lib/auth';
import { forgotPasswordFormSchema } from '@/types/auth';

const siteUrl = import.meta.env.VITE_PUBLIC_URL ?? '';

export const ForgotPasswordDialog = ({
  show = false,
  onShowChange,
}: {
  show?: boolean;
  onShowChange?: (show: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [requestAccepted, setRequestAccepted] = React.useState(false);
  const supabase = useSupabase();

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: { onSubmit: forgotPasswordFormSchema },
    onSubmit: async ({ value: { email } }) => {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthCallbackUrl({
          origin: siteUrl,
          flow: 'recovery',
          next: '/',
        }),
      });
      setIsLoading(false);

      if (error) {
        toast.error(
          'Unable to send a password reset email. Please try again later.',
        );
        return;
      }

      setRequestAccepted(true);
    },
  });

  const handleShowChange = React.useCallback(
    (nextShow: boolean) => {
      if (!nextShow) {
        form.reset();
        setRequestAccepted(false);
      }
      onShowChange?.(nextShow);
    },
    [form, onShowChange],
  );

  const handleSubmit = React.useCallback(
    (event: React.SubmitEvent) => {
      event.preventDefault();
      event.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  return (
    <Dialog open={show} onOpenChange={handleShowChange}>
      <DialogContent>
        {requestAccepted ? (
          <>
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                If an account exists for that address, a password reset email
                has been sent.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Check your spam folder if it does not arrive. The reset link can
              only be used once.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => handleShowChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form.AppForm>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Reset password</DialogTitle>
                <DialogDescription>
                  Enter your email to receive a password reset link.
                </DialogDescription>
              </DialogHeader>
              <form.AppField
                name="email"
                children={(field) => (
                  <field.Field>
                    <field.FieldLabel>Email</field.FieldLabel>
                    <field.Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
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
              <DialogFooter className="mt-4">
                <form.WaitButton loading={isLoading} type="submit">
                  Send reset email
                </form.WaitButton>
              </DialogFooter>
            </form>
          </form.AppForm>
        )}
      </DialogContent>
    </Dialog>
  );
};
