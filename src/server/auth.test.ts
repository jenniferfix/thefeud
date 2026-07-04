import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adminDeleteUser: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  from: vi.fn(),
  getClaims: vi.fn(),
  redisDel: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const builder = {
      handler: (handler: unknown) => handler,
      validator: () => builder,
    };
    return builder;
  },
}));

vi.mock('#/utils/supabase/backend', () => ({
  createSupabaseBackendClient: () => ({
    auth: { admin: { deleteUser: mocks.adminDeleteUser } },
    from: mocks.from,
  }),
}));

vi.mock('#/utils/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getClaims: mocks.getClaims,
      signOut: mocks.signOut,
    },
  }),
}));

vi.mock('#/integrations/redis', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('#/integrations/redis')>();
  return {
    ...original,
    getRedisClient: () => ({ del: mocks.redisDel }),
  };
});

import { deleteUser } from './auth';

const createJoinCodeQuery = () => {
  const query = {
    eq: vi.fn(),
    not: vi.fn(),
    select: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
};

describe('deleteUser', () => {
  const query = createJoinCodeQuery();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('REDIS_PREFIX', 'test-feud');
    mocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          app_metadata: { providers: ['email'] },
          email: 'host@example.com',
          sub: 'authenticated-user',
        },
      },
      error: null,
    });
    mocks.from.mockReturnValue(query);
    query.not.mockResolvedValue({ data: [], error: null });
    mocks.adminDeleteUser.mockResolvedValue({ data: null, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.redisDel.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects unauthenticated requests before privileged work', async () => {
    mocks.getClaims.mockResolvedValue({ data: null, error: null });

    await expect(deleteUser()).rejects.toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.adminDeleteUser).not.toHaveBeenCalled();
  });

  it('hard-deletes the authenticated user and cleans up their join codes', async () => {
    query.not.mockResolvedValue({
      data: [
        { join_code: 'ABC123' },
        { join_code: 'XYZ789' },
        { join_code: 'ABC123' },
      ],
      error: null,
    });

    await expect(deleteUser()).resolves.toEqual({ success: true });

    expect(mocks.from).toHaveBeenCalledWith('game_instance');
    expect(query.eq).toHaveBeenCalledWith('userid', 'authenticated-user');
    expect(query.not).toHaveBeenCalledWith('join_code', 'is', null);
    expect(mocks.adminDeleteUser).toHaveBeenCalledWith(
      'authenticated-user',
      false,
    );
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mocks.redisDel).toHaveBeenCalledWith([
      'test-feud:joincode:ABC123',
      'test-feud:joincode:XYZ789',
    ]);
  });

  it('does not delete the account when join-code lookup fails', async () => {
    const backendError = new Error('database details');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    query.not.mockResolvedValue({ data: null, error: backendError });

    await expect(deleteUser()).rejects.toThrow('Unable to delete account');
    expect(mocks.adminDeleteUser).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to collect account join codes',
      backendError,
    );

    consoleError.mockRestore();
  });

  it('skips Redis when the account has no join codes', async () => {
    await expect(deleteUser()).resolves.toEqual({ success: true });
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it('rejects hard-delete failures without exposing backend details', async () => {
    const backendError = new Error('secret backend details');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mocks.adminDeleteUser.mockResolvedValue({
      data: null,
      error: backendError,
    });

    await expect(deleteUser()).rejects.toThrow('Unable to delete account');
    await expect(deleteUser()).rejects.not.toThrow('secret backend details');
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('reports success when post-delete cleanup fails', async () => {
    const cookieError = new Error('cookie cleanup failed');
    const redisError = new Error('redis cleanup failed');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    query.not.mockResolvedValue({
      data: [{ join_code: 'ABC123' }],
      error: null,
    });
    mocks.signOut.mockResolvedValue({ error: cookieError });
    mocks.redisDel.mockRejectedValue(redisError);

    await expect(deleteUser()).resolves.toEqual({ success: true });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to clear deleted account session',
      cookieError,
    );
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to remove deleted account join codes',
      redisError,
    );

    consoleError.mockRestore();
  });
});
