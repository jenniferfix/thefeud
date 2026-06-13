import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { ErrorDialog } from '@/components/auth/ErrorDialog';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { SignInWithGoogle } from '@/components/auth/SignInWithGoogle';
import { SignUpDialog } from '@/components/auth/SignUpDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppForm } from '@/components/ui/tanstack-form';
import { getSafeRedirectPath } from '@/lib/auth';
import { useSupabaseAuth } from '@/supabaseauth';

export const SignIn = React.memo(
  ({ redirect, error }: { redirect?: string; error?: string }) => {
    const navigate = useNavigate();
    const [showSignUpDialog, setShowSignUpDialog] = React.useState(false);
    const [showPasswordReset, setShowPasswordReset] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [messageBoxTitle, setMessageBoxTitle] = React.useState<string | null>(
      null,
    );
    const [showErrorDialog, setShowErrorDialog] = React.useState(false);
    const auth = useSupabaseAuth();

    React.useEffect(() => {
      if (error === 'oauth_callback') {
        setMessageBoxTitle('Sign in error');
        setErrorMessage('Google sign in could not be completed.');
        setShowErrorDialog(true);
      }
    }, [error]);

    const form = useAppForm({
      defaultValues: {
        email: '',
        password: '',
        staySignedIn: false,
      },
      onSubmit: async ({ value: { email, password } }) => {
        setIsLoading(true);
        try {
          await auth.login({ email, password });
          await navigate({ to: getSafeRedirectPath(redirect) });
        } catch (loginError) {
          setMessageBoxTitle('Sign in error');
          setErrorMessage(
            loginError instanceof Error
              ? loginError.message
              : 'Unable to sign in.',
          );
          setShowErrorDialog(true);
        } finally {
          setIsLoading(false);
        }
      },
    });

    const handleSubmit = React.useCallback(
      (e: React.SubmitEvent) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      [form.handleSubmit],
    );

    return (
      <>
        <ErrorDialog
          title={messageBoxTitle}
          message={errorMessage}
          show={showErrorDialog}
          setShow={(show) => setShowErrorDialog(show)}
        />
        <SignUpDialog
          callbackURL={getSafeRedirectPath(redirect)}
          open={showSignUpDialog}
          onOpenChange={setShowSignUpDialog}
        />
        <ForgotPasswordDialog
          show={showPasswordReset}
          onShowChange={setShowPasswordReset}
        />
        <div className="h-full flex items-center justify-center">
          <Card className="max-w-sm bg-card/50">
            <form.AppForm>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Sign into The Feud</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 mb-4">
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
                      </field.Field>
                    )}
                  />
                  <form.AppField
                    name="staySignedIn"
                    children={(field) => (
                      <field.Field orientation="horizontal">
                        <field.Checkbox
                          checked={field.state.value}
                          onCheckedChange={(value) =>
                            field.handleChange(!!value)
                          }
                        />
                        <field.FieldLabel>Stay signed in</field.FieldLabel>
                      </field.Field>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <form.WaitButton loading={isLoading} className="w-full">
                    Sign in
                  </form.WaitButton>
                  <SignInWithGoogle
                    className="w-full"
                    redirect={getSafeRedirectPath(redirect)}
                  />
                  <div className="flex justify-center">or</div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSignUpDialog(true)}
                  >
                    Sign up using email
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    Forgot Password
                  </Button>
                </CardFooter>
              </form>
            </form.AppForm>
          </Card>
        </div>
      </>
    );
  },
);
