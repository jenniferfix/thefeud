import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getClaims: vi.fn(),
  getServerAuth: vi.fn(),
  redisDel: vi.fn(),
  redisGet: vi.fn(),
  redisSet: vi.fn(),
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
  createSupabaseBackendClient: () => ({ from: mocks.from }),
}));

vi.mock('#/utils/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: { getClaims: mocks.getClaims },
  }),
}));

vi.mock('#/integrations/redis', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('#/integrations/redis')>();
  return {
    ...original,
    getRedisClient: () => ({
      del: mocks.redisDel,
      get: mocks.redisGet,
      set: mocks.redisSet,
    }),
  };
});

vi.mock('./auth', () => ({
  getServerAuth: mocks.getServerAuth,
}));

import { isNotFound } from '@tanstack/react-router';
import { authorizeRealtimeViewer, deleteJoinCode } from './joincodes';

const GAME_INSTANCE_ID = 'instance-1';
const OWNER_ID = 'owner-user';
const VIEWER_ID = 'viewer-user';
const CODE = 'ABCDE';
const EXPIRES = '2999-01-01T00:00:00+00:00';

const validRedisEntry = JSON.stringify({
  code: CODE,
  gameInstanceId: GAME_INSTANCE_ID,
  use: 'watch',
  state: {
    leftTeam: 'Left',
    rightTeam: 'Right',
    gameTitle: 'Game',
    answers: {},
  },
});

type BuilderResult = { data: unknown };

const createBuilder = (getResult: () => BuilderResult) => {
  const builder = {
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    maybeSingle: vi.fn(() => builder),
    select: vi.fn(() => builder),
    throwOnError: vi.fn(() => Promise.resolve(getResult())),
    update: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
  };
  return builder;
};

let instanceResult: BuilderResult;
const gameInstanceBuilder = createBuilder(() => instanceResult);
const viewerBuilder = createBuilder(() => ({ data: null }));

beforeEach(() => {
  vi.clearAllMocks();
  instanceResult = { data: null };
  mocks.from.mockImplementation((table: string) =>
    table === 'game_realtime_viewers' ? viewerBuilder : gameInstanceBuilder,
  );
});

describe('authorizeRealtimeViewer', () => {
  const setClaims = (sub: string | null) => {
    mocks.getClaims.mockResolvedValue(
      sub
        ? { data: { claims: { sub } }, error: null }
        : { data: null, error: new Error('no session') },
    );
  };

  it('rejects with notFound when there is no session', async () => {
    setClaims(null);

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
    expect(mocks.redisGet).not.toHaveBeenCalled();
  });

  it('rejects with notFound when the code is not in redis', async () => {
    setClaims(VIEWER_ID);
    mocks.redisGet.mockResolvedValue(null);

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
  });

  it('rejects with notFound instead of surfacing malformed redis JSON', async () => {
    setClaims(VIEWER_ID);
    mocks.redisGet.mockResolvedValue('{not json');

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
  });

  it('rejects with notFound instead of surfacing schema-invalid redis data', async () => {
    setClaims(VIEWER_ID);
    mocks.redisGet.mockResolvedValue(JSON.stringify({ wrong: 'shape' }));

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
  });

  it('rejects with notFound when the code is expired or replaced in the database', async () => {
    setClaims(VIEWER_ID);
    mocks.redisGet.mockResolvedValue(validRedisEntry);
    instanceResult = { data: null };

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
    expect(viewerBuilder.upsert).not.toHaveBeenCalled();
  });

  it('grants a non-owner viewer access until the join code expires', async () => {
    setClaims(VIEWER_ID);
    mocks.redisGet.mockResolvedValue(validRedisEntry);
    instanceResult = {
      data: {
        id: GAME_INSTANCE_ID,
        userid: OWNER_ID,
        join_code: CODE,
        join_code_expires: EXPIRES,
      },
    };

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).resolves.toEqual({ gameInstanceId: GAME_INSTANCE_ID });

    expect(viewerBuilder.upsert).toHaveBeenCalledWith({
      user_id: VIEWER_ID,
      game_instance_id: GAME_INSTANCE_ID,
      expires_at: EXPIRES,
    });
  });

  it('does not create a grant for the owning host', async () => {
    setClaims(OWNER_ID);
    mocks.redisGet.mockResolvedValue(validRedisEntry);
    instanceResult = {
      data: {
        id: GAME_INSTANCE_ID,
        userid: OWNER_ID,
        join_code: CODE,
        join_code_expires: EXPIRES,
      },
    };

    await expect(
      authorizeRealtimeViewer({ data: { code: CODE } }),
    ).resolves.toEqual({ gameInstanceId: GAME_INSTANCE_ID });
    expect(viewerBuilder.upsert).not.toHaveBeenCalled();
  });
});

describe('deleteJoinCode', () => {
  it('rejects with notFound when unauthenticated', async () => {
    mocks.getServerAuth.mockResolvedValue({ user: null });

    await expect(
      deleteJoinCode({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it('rejects with notFound when the caller does not own the game', async () => {
    mocks.getServerAuth.mockResolvedValue({ user: { id: VIEWER_ID } });
    instanceResult = { data: { id: GAME_INSTANCE_ID, userid: OWNER_ID } };

    await expect(
      deleteJoinCode({ data: { code: CODE } }),
    ).rejects.toSatisfy(isNotFound);
    expect(mocks.redisDel).not.toHaveBeenCalled();
    expect(viewerBuilder.delete).not.toHaveBeenCalled();
  });

  it('removes viewer grants, join code columns, and the redis key for the owner', async () => {
    mocks.getServerAuth.mockResolvedValue({ user: { id: OWNER_ID } });
    instanceResult = { data: { id: GAME_INSTANCE_ID, userid: OWNER_ID } };
    mocks.redisDel.mockResolvedValue(1);

    await expect(deleteJoinCode({ data: { code: CODE } })).resolves.toEqual({
      success: true,
    });

    expect(viewerBuilder.delete).toHaveBeenCalled();
    expect(viewerBuilder.eq).toHaveBeenCalledWith(
      'game_instance_id',
      GAME_INSTANCE_ID,
    );
    expect(gameInstanceBuilder.update).toHaveBeenCalledWith({
      join_code: null,
      join_code_expires: null,
    });
    expect(mocks.redisDel).toHaveBeenCalledTimes(1);
  });
});
