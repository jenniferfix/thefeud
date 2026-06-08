import { useNavigate } from "@tanstack/react-router";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/components/ui/tanstack-form";
import useSupabase from "@/hooks/useSupabase";
//import { authClient } from "@/lib/auth/client";
import { passwordField } from "@/types/auth";

export const ResetPasswordCard = React.memo(({ token }: { token?: string }) => {
  const navigate = useNavigate();
  const form = useAppForm({
    defaultValues: {
      password: "",
      passwordVerify: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        //
      },
    },
    onSubmit: async ({ value }) => {
      // void authClient.resetPassword(
      //   {
      //     newPassword: value.password,
      //     token,
      //   },
      //   {
      //     onSuccess: ({ data }) => {
      //       navigate({ to: "/sign-in" });
      //     },
      //   },
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
    <Card className="min-w-sm">
      <form.AppForm>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form.AppField
              name="password"
              validators={{ onBlur: passwordField.parse }}
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>New Password</field.FieldLabel>
                  <field.FormPassword
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <field.FieldInfo field={field} />
                </field.Field>
              )}
            />
            <form.AppField
              name="passwordVerify"
              validators={{
                onBlur: (opts) => {
                  // if (form.getFieldMeta("password")?.isValid)
                  //
                },
              }}
              children={(field) => {
                const passwordField = form.getFieldMeta("password");

                return (
                  <field.Field>
                    <field.FieldLabel>Verify Password</field.FieldLabel>
                    <field.FormPassword
                      disabled={
                        !form.getFieldMeta("password")?.isValid ||
                        !form.getFieldMeta("password")?.isTouched
                      }
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <field.FieldInfo field={field} />
                  </field.Field>
                );
              }}
            />
          </CardContent>
          <CardFooter className="mt-4">
            <form.WaitButton loading={false} type="submit">
              Reset Password
            </form.WaitButton>
          </CardFooter>
        </form>
      </form.AppForm>
    </Card>
  );
});
