import React from "react";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/auth/ErrorDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/components/ui/tanstack-form";
import useSupabase from "@/hooks/useSupabase";
//import { authClient } from "@/lib/auth/client";
import { signUpFormSchema } from "@/types/auth";

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
      email: "",
      password: "",
      verifyPassword: "",
      name: "",
    },
    validators: {
      onSubmit: signUpFormSchema.parse,
    },
    onSubmit: async ({ value: { email, password, name } }) => {
      const res = supabase.auth.signUp({ email, password });
      // authClient.signUp.email(
      // 	{
      // 		email: value.email,
      // 		password: value.password,
      // 		name: value.name,
      // 		callbackURL,
      // 	},
      // 	{
      // 		onSuccess: async () => {
      // 			toast("Verification email sent");
      // 			setIsLoading(false);
      // 			onOpenChange?.(false);
      // 			// navigate({ to: "/" });
      // 		},
      // 		onError: async (ctx) => {
      // 			setIsLoading(false);
      // 			console.error(ctx.error);
      // 			const { message } = ctx.error;
      // 			setErrorMessage(message);
      // 			setMessageBoxTitle("Sign in error");
      // 			setShowErrorDialog(true);
      // 		},
      // 		onRequest: async () => {
      // 			setIsLoading(true);
      // 		},
      // 	},
      // );
    },
  });
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
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
                {/* <form.WaitButton type="submit" loading={isLoading}> */}
                {/* 	Sign up */}
                {/* </form.WaitButton> */}
              </DialogFooter>
            </form>
          </form.AppForm>
        </DialogContent>
      </Dialog>
    </>
  );
};
