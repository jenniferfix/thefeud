import { useNavigate, useRouter } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { ErrorDialog } from '@/components/auth/ErrorDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useSupabase } from '@/hooks/useSupabase';
import { newPasswordSchema } from '@/types/auth';

export const ResetPasswordCard = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const supabase = useSupabase();
  const router = useRouter();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      password: '',
      passwordVerify: '',
    },
    validators: { onSubmit: newPasswordSchema },
    onSubmit: async ({ value: { password } }) => {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setIsLoading(false);
        if (error.status === 401) {
          await navigate({
            to: '/login',
            search: { redirect: '/', error: 'password_recovery' },
          });
          return;
        }
        setShowErrorDialog(true);
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'others',
      });
      setIsLoading(false);

      if (signOutError) {
        toast.warning(
          'Password updated, but other sessions could not be signed out.',
        );
      } else {
        toast.success('Password updated');
      }

      form.reset();
      await router.invalidate();
      await navigate({ to: '/' });
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
    <>
      <ErrorDialog
        title="Password reset error"
        message="Your password could not be updated. Request a new reset link and try again."
        show={showErrorDialog}
        setShow={setShowErrorDialog}
      />
      <Card className="w-full max-w-sm bg-card/80">
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Choose a new password</CardTitle>
              <CardDescription>
                Use between 8 and 128 characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
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
            </CardContent>
            <CardFooter className="mt-4">
              <form.WaitButton
                className="w-full"
                loading={isLoading}
                type="submit"
              >
                Update password
              </form.WaitButton>
            </CardFooter>
          </form>
        </form.AppForm>
      </Card>
    </>
  );
};
