import { useStore } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
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
import useSupabase from '@/hooks/useSupabase';
import { passwordField } from '@/types/auth';

export const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const currentPassFieldRef = React.useRef<HTMLInputElement | null>(null);
  const passFieldRef = React.useRef<HTMLInputElement | null>(null);

  const [inProgress, setInProgress] = React.useState(false);
  const form = useAppForm({
    defaultValues: {
      password: '',
      newPassword: '',
      currentPassword: '',
      revokeOtherSessions: false,
    },
    validators: {
      onSubmit: ({ value }) => {
        const { data: password, error: passwordError } =
          passwordField.safeParse(value.password);
        const { data: newPassword, error: passwordVerifyError } =
          passwordField.safeParse(value.newPassword);
        const { data: currentPassword, error: currentPasswordError } =
          passwordField.safeParse(value.currentPassword);

        // TODO: Fix this if there are multiple errors
        if (passwordError) return passwordError?.message;
        if (passwordVerifyError) return passwordVerifyError?.message;
        if (currentPasswordError) return currentPasswordError?.message;

        if (password !== newPassword) return 'Passwords must match';
        return undefined;
      },
    },
    onSubmit: async ({
      value: { currentPassword, newPassword, revokeOtherSessions },
      value,
    }) => {
      setInProgress(true);
      // void authClient.changePassword(
      //   {
      //     currentPassword,
      //     newPassword,
      //     revokeOtherSessions,
      //   },
      //   {
      //     onSuccess: (ctx) => {
      //       toast("Password changed");
      //       setInProgress(false);
      //       onOpenChange?.(false);
      //     },
      //     onError: async ({ error }) => {
      //       setInProgress(false);
      //       switch (error.code) {
      //         case "INVALID_PASSWORD":
      //           toast(error.message);
      //           currentPassFieldRef.current?.focus();
      //           currentPassFieldRef.current?.select();
      //           break;
      //         case "INVALID_SESSION":
      //           toast(error.message);
      //           break;
      //         case "PASSWORD_TOO_SHORT":
      //           toast(error.message);
      //           passFieldRef.current?.focus();
      //           passFieldRef.current?.select();
      //           break;
      //         case "PASSWORD_TOO_LONG":
      //           toast(error.message);
      //           passFieldRef.current?.focus();
      //           passFieldRef.current?.select();
      //           break;
      //         case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      //           toast(error.message);
      //           break;
      //         default:
      //           toast("Unknown error");
      //           break;
      //       }
      //     },
      //   },
      // );
    },
  });
  const passField = useStore(form.store, (state) => state.fieldMeta.password);
  const passFieldValid = passField?.isValid;
  const passFieldTouched = passField?.isTouched;

  const handleSubmit = React.useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Your password must be 8 characters in length
              </DialogDescription>
            </DialogHeader>

            <form.AppField
              name="currentPassword"
              validators={{ onBlur: passwordField }}
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>Current Password</field.FieldLabel>
                  <field.FormPassword
                    ref={currentPassFieldRef}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <field.FieldInfo field={field} />
                </field.Field>
              )}
            />

            <form.AppField
              name="password"
              validators={{ onChange: passwordField }}
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>New Password</field.FieldLabel>
                  <field.FormPassword
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <field.FieldInfo field={field} />
                </field.Field>
              )}
            />

            <form.AppField
              name="newPassword"
              validators={{
                onChange: ({ value }) =>
                  value !== form.getFieldValue('password')
                    ? 'Passwords must match'
                    : undefined,
              }}
              children={(field) => {
                // const passwordField = form.getFieldMeta("password");

                return (
                  <field.Field>
                    <field.FieldLabel>Verify Password</field.FieldLabel>
                    <field.FormPassword
                      disabled={!passFieldValid || !passFieldTouched}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <field.FieldInfo field={field} />
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="revokeOtherSessions"
              children={(field) => (
                <field.Field orientation="horizontal">
                  <field.Checkbox
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <field.FieldLabel>Revoke other sessions</field.FieldLabel>
                </field.Field>
              )}
            />
            <DialogFooter>
              <form.WaitButton
                aria-disabled={inProgress}
                loading={inProgress}
                type="submit"
              >
                Change
              </form.WaitButton>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onSubmit={() => {
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
