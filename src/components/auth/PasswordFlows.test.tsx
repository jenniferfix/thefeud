// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ResetPasswordCard } from './ResetPasswordCard';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  invalidate: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
  useRouter: () => ({ invalidate: mocks.invalidate }),
}));

vi.mock('@/hooks/useSupabase', () => ({
  useSupabase: () => ({
    auth: { updateUser: mocks.updateUser, signOut: mocks.signOut },
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess, warning: mocks.toastWarning },
}));

beforeEach(() => {
  mocks.navigate.mockResolvedValue(undefined);
  mocks.invalidate.mockResolvedValue(undefined);
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('password workflows', () => {
  it('resets a recovered password and revokes other sessions', async () => {
    render(<ResetPasswordCard />);

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({
        password: 'new-password-123',
      });
    });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'others' });
    expect(mocks.invalidate).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('changes a password using the current password', async () => {
    const onOpenChange = vi.fn();
    render(<ChangePasswordDialog open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'current-password' },
    });
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'new-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({
        current_password: 'current-password',
        password: 'new-password-123',
      });
    });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'others' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
