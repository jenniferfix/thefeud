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
import { type AuthRouteError, getSafeRedirectPath } from '@/lib/auth';
import { useSupabaseAuth } from '@/supabaseauth';
import { signInFormSchema } from '@/types/auth';

const authErrorMessages: Record<
  AuthRouteError,
  { title: string; message: string }
> = {
  oauth_callback: {
    title: 'Google sign in error',
    message: 'Google sign in could not be completed. Please try again.',
  },
  email_confirmation: {
    title: 'Email verification error',
    message:
      'The verification link is invalid or expired. Sign up again or resend the verification email.',
  },
  password_recovery: {
    title: 'Password recovery error',
    message:
      'The password recovery link is invalid or expired. Request a new link and try again.',
  },
};

export const SignIn = React.memo(
  ({ redirect, error }: { redirect?: string; error?: AuthRouteError }) => {
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
      if (error) {
        const errorContent = authErrorMessages[error];
        setMessageBoxTitle(errorContent.title);
        setErrorMessage(errorContent.message);
        setShowErrorDialog(true);
      }
    }, [error]);

    const form = useAppForm({
      defaultValues: {
        email: '',
        password: '',
      },
      validators: {
        onSubmit: signInFormSchema,
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
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                        <field.FieldLabel>Password</field.FieldLabel>
                        <field.FormPassword
                          autoComplete="current-password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <field.FieldInfo field={field} />
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
                    variant="outline"
                    onClick={() => setShowPasswordReset(true)}
                    className="w-full"
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
