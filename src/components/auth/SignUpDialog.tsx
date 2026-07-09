import { useNavigate, useRouter } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import {
  AuthCaptcha,
  type AuthCaptchaHandle,
  isCaptchaEnabled,
} from '@/components/auth/AuthCaptcha';
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
import { buildAuthCallbackUrl, getSafeRedirectPath } from '@/lib/auth';
import { signUpFormSchema } from '@/types/auth';

const RESEND_COOLDOWN_SECONDS = 60;

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
  const [isResending, setIsResending] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = React.useState(0);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const captchaRef = React.useRef<AuthCaptchaHandle | null>(null);
  const supabase = useSupabase();
  const router = useRouter();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (resendSeconds <= 0) return;

    const timeout = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendSeconds]);

  const getEmailRedirectTo = React.useCallback(
    () =>
      buildAuthCallbackUrl({
        origin: window.location.origin,
        flow: 'signup',
        next: callbackURL,
      }),
    [callbackURL],
  );

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
      const trimmedName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: trimmedName ? { name: trimmedName } : {},
          emailRedirectTo: getEmailRedirectTo(),
          captchaToken: captchaToken ?? undefined,
        },
      });
      captchaRef.current?.reset();
      setIsLoading(false);

      if (error) {
        toast.error('Unable to create the account. Please try again.');
        return;
      }

      if (data.session) {
        toast.success('Account created');
        form.reset();
        onOpenChange?.(false);
        await router.invalidate();
        await navigate({ to: getSafeRedirectPath(callbackURL) });
        return;
      }

      setPendingEmail(email);
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    },
  });

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        form.reset();
        setPendingEmail(null);
        setResendSeconds(0);
        setIsResending(false);
      }
      onOpenChange?.(nextOpen);
    },
    [form, onOpenChange],
  );

  const handleSubmit = React.useCallback(
    (event: React.SubmitEvent) => {
      event.preventDefault();
      event.stopPropagation();
      form.handleSubmit();
    },
    [form],
  );

  const handleResend = React.useCallback(async () => {
    if (!pendingEmail || resendSeconds > 0) return;

    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        captchaToken: captchaToken ?? undefined,
      },
    });
    captchaRef.current?.reset();
    setIsResending(false);

    if (error) {
      toast.error('Unable to resend the verification email. Try again later.');
      return;
    }

    setResendSeconds(RESEND_COOLDOWN_SECONDS);
    toast.success('Verification email resent');
  }, [captchaToken, getEmailRedirectTo, pendingEmail, resendSeconds, supabase]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {pendingEmail ? (
          <>
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We sent a verification link to {pendingEmail}. Open it to finish
                creating your account.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              If the message does not arrive, check your spam folder or resend
              it below.
            </p>
            <AuthCaptcha ref={captchaRef} onToken={setCaptchaToken} />
            <DialogFooter className="flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingEmail(null)}
              >
                Use a different email
              </Button>
              <Button
                type="button"
                disabled={
                  isResending ||
                  resendSeconds > 0 ||
                  (isCaptchaEnabled() && !captchaToken)
                }
                onClick={handleResend}
              >
                {isResending
                  ? 'Sending…'
                  : resendSeconds > 0
                    ? `Resend in ${resendSeconds}s`
                    : 'Resend verification email'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form.AppForm>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create your account</DialogTitle>
                <DialogDescription>
                  Sign up using your email address
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
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
                <form.AppField
                  name="name"
                  children={(field) => (
                    <field.Field>
                      <field.FieldLabel>Name (optional)</field.FieldLabel>
                      <field.Input
                        autoComplete="name"
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
                      <field.FieldLabel>Password</field.FieldLabel>
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
                      <field.FieldLabel>Confirm password</field.FieldLabel>
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
                <AuthCaptcha ref={captchaRef} onToken={setCaptchaToken} />
              </div>
              <DialogFooter className="mt-4">
                <form.WaitButton loading={isLoading} type="submit">
                  Create account
                </form.WaitButton>
              </DialogFooter>
            </form>
          </form.AppForm>
        )}
      </DialogContent>
    </Dialog>
  );
};
