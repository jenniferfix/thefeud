import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  newPasswordSchema,
  signInFormSchema,
  signUpFormSchema,
} from './auth';

describe('auth form schemas', () => {
  it('accepts sign-up with an optional name and matching passwords', () => {
    expect(
      signUpFormSchema.safeParse({
        email: 'host@example.com',
        name: '',
        password: 'password123',
        passwordVerify: 'password123',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid email and mismatched passwords', () => {
    expect(
      signInFormSchema.safeParse({ email: 'not-an-email', password: 'short' })
        .success,
    ).toBe(false);
    expect(
      signUpFormSchema.safeParse({
        email: 'host@example.com',
        name: 'Host',
        password: 'password123',
        passwordVerify: 'different123',
      }).success,
    ).toBe(false);
  });

  it('validates reset and change password confirmation', () => {
    expect(
      newPasswordSchema.safeParse({
        password: 'password123',
        passwordVerify: 'password123',
      }).success,
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'current123',
        password: 'password123',
        passwordVerify: 'different123',
      }).success,
    ).toBe(false);
  });
});
