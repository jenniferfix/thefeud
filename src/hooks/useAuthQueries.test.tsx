// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseAuthProvider } from '@/supabaseauth';
import { useDeleteUser } from './useAuthQueries';

const mocks = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  invalidate: vi.fn(),
  navigate: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('#/server/auth', () => ({ deleteUser: mocks.deleteUser }));

vi.mock('@/hooks/useSupabase', () => ({
  useSupabase: () => ({
    auth: {
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
  }),
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

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider
        initialUser={{
          id: 'authenticated-user',
          email: 'host@example.com',
          providers: ['email'],
        }}
      >
        {children}
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  mocks.deleteUser.mockResolvedValue({ success: true });
  mocks.invalidate.mockResolvedValue(undefined);
  mocks.navigate.mockResolvedValue(undefined);
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
  mocks.signOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useDeleteUser', () => {
  it('signs out, clears cached data, invalidates auth, and redirects home', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['owned-games'], [{ id: 'game-1' }]);
    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(['owned-games'])).toBeUndefined();
    expect(mocks.invalidate).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/',
      replace: true,
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Account deleted');
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('does not misreport deletion when local logout cleanup fails', async () => {
    const queryClient = new QueryClient();
    const logoutError = new Error('logout failed');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    queryClient.setQueryData(['owned-games'], [{ id: 'game-1' }]);
    mocks.signOut.mockResolvedValue({ error: logoutError });
    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryClient.getQueryData(['owned-games'])).toBeUndefined();
    expect(mocks.invalidate).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/',
      replace: true,
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Account deleted');
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to finalize deleted account logout',
      logoutError,
    );

    consoleError.mockRestore();
  });
});
