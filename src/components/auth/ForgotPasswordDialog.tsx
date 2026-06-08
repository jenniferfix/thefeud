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
//import { authClient } from "@/lib/auth/client";
import { forgotPasswordFormSchema } from "@/types/auth";

export const ForgotPasswordDialog = ({
	show = false,
	onShowChange,
}: {
	show?: boolean;
	onShowChange?: (show: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [messageBoxTitle, setMessageBoxTitle] = React.useState<string | null>(
    null,
  );
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordFormSchema.parse,
    },
    onSubmit: async ({ value }) => {
      // authClient.requestPasswordReset(
      // 	{
      // 		email: value.email,
      // 		redirectTo: "/reset-password",
      // 	},
      // 	{
      // 		onSuccess: async () => {
      // 			toast("Check your email");
      // 			setIsLoading(false);
      // 			onShowChange?.(false);
      // 			// navigate({ to: "/reset-password" });
      // 		},
      // 		onError: async (ctx) => {
      // 			setIsLoading(false);
      // 			const { message, status } = ctx.error;
      // 			console.log("error", status);
      // 			setErrorMessage(message);
      // 			setMessageBoxTitle("Password reset error");
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
      <Dialog open={show} onOpenChange={onShowChange}>
        <DialogContent>
          <form.AppForm>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email to recieve a link to reset your password
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
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
              </div>
              <DialogFooter className="mt-4">
                <form.WaitButton loading={isLoading} type="submit">
                  Send Email
                </form.WaitButton>
              </DialogFooter>
            </form>
          </form.AppForm>
        </DialogContent>
      </Dialog>
    </>
  );
};
