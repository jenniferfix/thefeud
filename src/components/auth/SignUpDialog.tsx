import React from 'react';
import { toast } from 'sonner';
import { ErrorDialog } from '@/components/auth/ErrorDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/components/ui/tanstack-form';
import useSupabase from '@/hooks/useSupabase';
import { getSafeRedirectPath } from '@/lib/auth';
import { signUpFormSchema } from '@/types/auth';

export const SignUpDialog = ({
  open = false,
  onOpenChange,
  callbackURL,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  callbackURL?: string;
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [messageBoxTitle, setMessageBoxTitle] = React.useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const supabase = useSupabase();

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      passwordVerify: '',
      name: '',
    },
    validators: {
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value: { email, password, name } }) => {
      setIsLoading(true);
      const emailRedirectUrl = new URL(
        '/auth/callback',
        window.location.origin,
      );
      emailRedirectUrl.searchParams.set(
        'next',
        getSafeRedirectPath(callbackURL),
      );

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: emailRedirectUrl.toString(),
        },
      });

      setIsLoading(false);
      if (error) {
        setMessageBoxTitle('Sign up error');
        setErrorMessage(error.message);
        setShowErrorDialog(true);
        return;
      }

      toast('Verification email sent');
      onOpenChange?.(false);
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
    <>
      <ErrorDialog
        title={messageBoxTitle}
        message={errorMessage}
        show={showErrorDialog}
        setShow={(show) => setShowErrorDialog(show)}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form.AppForm>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Sign up</DialogTitle>
                <DialogDescription>
                  Sign up using your email address
                </DialogDescription>
              </DialogHeader>
              <div>
                <form.AppField
                  name="email"
                  children={(field) => (
                    <field.Field className="">
                      <field.FieldLabel>Email</field.FieldLabel>
                      <field.Input
                        placeholder="you@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <field.FieldInfo field={field} />
                    </field.Field>
                  )}
                />
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.Field>
                      <field.FieldLabel>Password</field.FieldLabel>
                      <field.FormPassword
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <field.FieldInfo field={field} />
                    </field.Field>
                  )}
                />
                <form.AppField
                  name="name"
                  children={(field) => (
                    <field.Field>
                      <field.FieldLabel>Name</field.FieldLabel>
                      <field.Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <field.FieldInfo field={field} />
                    </field.Field>
                  )}
                />
              </div>
              <DialogFooter>
                <form.WaitButton loading={isLoading} type="submit">
                  Sign up
                </form.WaitButton>
              </DialogFooter>
            </form>
          </form.AppForm>
        </DialogContent>
      </Dialog>
    </>
  );
};
