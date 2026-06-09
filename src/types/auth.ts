import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const emailField = z.email();

export const passwordField = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(MAX_PASSWORD_LENGTH);

export const gameNameField = z.string().min(3).max(100);

const verifyPasswordSchema = z.object({
  password: passwordField,
  passwordVerify: passwordField,
});

export const newPasswordSchema = z
  .object({
    ...verifyPasswordSchema.shape,
  })
  .refine((data) => data.password === data.passwordVerify, {
    message: 'Passwords do not match',
    path: ['passwordVerify'],
  });

export const baseSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const signInFormSchema = z.object({
  ...baseSchema.shape,
  staySignedIn: z.boolean(),
});

export const signInRouteParams = z.object({
  inviteCode: z.string().optional(),
});

export const signUpFormSchema = z
  .object({
    email: emailField,
    name: z.string(),
    ...verifyPasswordSchema.shape,
  })
  .refine((data) => data.password === data.passwordVerify, {
    message: 'Passwords do not match',
    path: ['passwordVerify'],
  });

export const forgotPasswordFormSchema = z.object({
  email: emailField,
});

export const resetPasswordRouteSearchSchema = z.object({
  error: z.string().optional(),
  token: z.string().optional(),
});
