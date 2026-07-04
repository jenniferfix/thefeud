// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteUserButton } from './DeleteUserButton';

const mocks = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  invalidate: vi.fn(),
  logout: vi.fn(),
  navigate: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('#/server/auth', () => ({ deleteUser: mocks.deleteUser }));

vi.mock('@/supabaseauth', () => ({
  useSupabaseAuth: () => ({ logout: mocks.logout }),
}));

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    invalidate: mocks.invalidate,
    navigate: mocks.navigate,
  }),
}));

vi.mock('sonner', () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

const renderDeleteButton = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteUserButton />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  mocks.deleteUser.mockResolvedValue({ success: true });
  mocks.invalidate.mockResolvedValue(undefined);
  mocks.logout.mockResolvedValue(undefined);
  mocks.navigate.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DeleteUserButton', () => {
  it('opens and cancels without deleting the account', async () => {
    renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(screen.getByRole('alertdialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('locks the open dialog while deletion is pending', async () => {
    let resolveDeletion: (value: { success: true }) => void = () => undefined;
    mocks.deleteUser.mockReturnValue(
      new Promise((resolve) => {
        resolveDeletion = resolve;
      }),
    );
    renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    const pendingAction = await screen.findByRole('button', {
      name: 'Deleting…',
    });
    expect(pendingAction).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('alertdialog')).toBeTruthy();

    resolveDeletion({ success: true });
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: '/',
        replace: true,
      });
    });
  });

  it('keeps failures open and resets stale state before retry', async () => {
    mocks.deleteUser
      .mockRejectedValueOnce(new Error('server failed'))
      .mockResolvedValueOnce({ success: true });
    renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Unable to delete account. Please try again.',
      );
    });
    expect(screen.getByRole('alertdialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    await waitFor(() => {
      expect(mocks.deleteUser).toHaveBeenCalledTimes(2);
    });
  });

  it('rejects malformed server success responses', async () => {
    mocks.deleteUser.mockResolvedValue({ success: false });
    renderDeleteButton();

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Unable to delete account. Please try again.',
      );
    });
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });
});
