// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { SignUpDialog } from './SignUpDialog';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  invalidate: vi.fn(),
  signUp: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
  useRouter: () => ({ invalidate: mocks.invalidate }),
}));

vi.mock('@/hooks/useSupabase', () => ({
  useSupabase: () => ({
    auth: {
      signUp: mocks.signUp,
      resend: mocks.resend,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess },
}));

beforeEach(() => {
  mocks.navigate.mockResolvedValue(undefined);
  mocks.invalidate.mockResolvedValue(undefined);
  mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  mocks.resend.mockResolvedValue({ error: null });
  mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('email auth entry flows', () => {
  it('shows a persistent verification state and resend cooldown', async () => {
    render(<SignUpDialog open onOpenChange={vi.fn()} callbackURL="/games" />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'host@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Name (optional)'), {
      target: { value: 'Game Host' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Check your email')).toBeTruthy();
    expect(screen.getByText(/host@example.com/)).toBeTruthy();
    const resendButton = screen.getByRole('button', { name: 'Resend in 60s' });
    expect(resendButton).toHaveProperty('disabled', true);
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'host@example.com',
        password: 'new-password-123',
        options: expect.objectContaining({ data: { name: 'Game Host' } }),
      }),
    );
    const redirect = mocks.signUp.mock.calls[0][0].options.emailRedirectTo;
    expect(redirect).toContain('flow=signup');
    expect(redirect).toContain('next=%2Fgames');
  });

  it('uses the same generic recovery result for every accepted request', async () => {
    render(<ForgotPasswordDialog show onShowChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'unknown@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset email' }));

    expect(
      await screen.findByText(
        'If an account exists for that address, a password reset email has been sent.',
      ),
    ).toBeTruthy();
    await waitFor(() => {
      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
        'unknown@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('flow=recovery'),
        }),
      );
    });
  });
});
