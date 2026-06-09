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
import useSupabase from '@/hooks/useSupabase';
import { useSupabaseAuth } from '@/supabaseauth';
import { signInFormSchema } from '@/types/auth';

export const SignIn = React.memo(({ redirect }: { redirect?: string }) => {
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
  const supabase = useSupabase();

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      staySignedIn: false,
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: async ({ value: { email, password } }) => {
      // const res=await supabase.auth.signInWithEmail({ email, password })
      setIsLoading(true);
      await auth.login({ email, password });
      setIsLoading(false);
      // authClient.signIn.email(
      //   {
      //     email: value.email,
      //     password: value.password,
      //   },
      //   {
      //     onSuccess: async () => {
      //       setIsLoading(false);
      //       navigate({ to: "/" });
      //     },
      //     onError: async (ctx) => {
      //       setIsLoading(false);
      //       const { message } = ctx.error;
      //       setErrorMessage(message);
      //       setMessageBoxTitle("Sign-up error");
      //       setShowErrorDialog(true);
      //     },
      //     onRequest: async () => {
      //       setIsLoading(true);
      //     },
      //   },
      // );
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
        callbackURL="/sign-in"
        open={showSignUpDialog}
        onOpenChange={setShowSignUpDialog}
      />
      <ForgotPasswordDialog
        show={showPasswordReset}
        onShowChange={setShowPasswordReset}
      />
      <Card className="max-w-sm">
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign into Call Cat</CardTitle>
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
                      onCheckedChange={(value) => field.handleChange(!!value)}
                    />
                    <field.FieldLabel>Stay signed in</field.FieldLabel>
                  </field.Field>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <form.WaitButton
                loading={isLoading}
                className="w-full"
                type="submit"
              >
                Sign in
              </form.WaitButton>
              <SignInWithGoogle className="w-full" />
              <div className="flex justify-center">or</div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSignUpDialog(true)}
              >
                Sign up using email
              </Button>
              <Button variant="link" onClick={() => setShowPasswordReset(true)}>
                Forgot Password
              </Button>
            </CardFooter>
          </form>
        </form.AppForm>
      </Card>
    </>
  );
});
