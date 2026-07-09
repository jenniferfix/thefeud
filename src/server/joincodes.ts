import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getJoinCodeRedisKey, getRedisClient } from '#/integrations/redis';
import { generateJoinCode, normalizeJoinCode } from '#/lib/api/joincodes';
import { toGameBoardState } from '#/lib/gameboard-state';
import {
  createJoinCodeRPCSchema,
  getJoinCodeGameRPCSchema,
  redisCodeStorageSchema,
  redisCodeStorageUpdateSchema,
} from '#/lib/schemas/joincode';
import { createSupabaseBackendClient } from '#/utils/supabase/backend';
import { createSupabaseServerClient } from '#/utils/supabase/server';
import {
  getGameInstance,
  getGameInstanceUser,
} from '@/queries/instancequeries';
import { getServerAuth } from './auth';

const redis = getRedisClient();
const supabase = createSupabaseBackendClient();

const EXPIRE_SECONDS = 60 * 60 * 24 * 7; // Week
const MAX_RETRIES = 5;

export const createJoinCode = createServerFn({ method: 'GET' })
  .validator(createJoinCodeRPCSchema)
  .handler(async ({ data: { gameInstanceId } }) => {
    const [auth, gameInstance] = await Promise.all([
      getServerAuth(),
      getGameInstance(supabase, gameInstanceId),
    ]);
    const {
      data: currentGameInstance,
      success: currentGameInstanceSuccess,
      error,
    } = gameInstance;
    if (
      !auth.user ||
      !currentGameInstanceSuccess ||
      !currentGameInstance ||
      auth.user.id !== currentGameInstance.userId
    )
      throw notFound({ data: { error } });
    const state = toGameBoardState(currentGameInstance);
    let finished = false;
    let success = false;
    let attempt = 0;
    let code: string | null = null;
    while (!finished) {
      code = generateJoinCode();
      const {
        data: insertData,
        success: parseSuccess,
        error: parseError,
      } = redisCodeStorageSchema.safeParse({
        code,
        gameInstanceId,
        use: 'watch',
        state,
      });
      if (!parseSuccess)
        throw Error(
          'Problem parsing initial redis data in createJoinCode',
          parseError,
        );
      const expireTime = new Date(Date.now() + EXPIRE_SECONDS * 1000);

      const res = await redis.set(
        getJoinCodeRedisKey(code),
        JSON.stringify(insertData),
        'EX',
        EXPIRE_SECONDS, // Week
        'NX',
      );

      if (res) {
        finished = true;
        success = true;
      } else {
        attempt += 1;
        if (attempt >= MAX_RETRIES) {
          finished = true;
          throw Error(`Maximum code insert attempts reached: ${attempt}`);
        }
      }

      if (success) {
        // Replacing a code invalidates any viewer grants issued under it.
        await supabase
          .from('game_realtime_viewers')
          .delete()
          .eq('game_instance_id', gameInstanceId)
          .throwOnError();
        await supabase
          .from('game_instance')
          .update({
            join_code: code,
            join_code_expires: expireTime.toISOString(),
          })
          .eq('id', gameInstanceId)
          .throwOnError();
      }
    }
    return { success, data: success ? code : undefined };
  });

export const updateJoinCode = createServerFn({ method: 'GET' })
  .validator(redisCodeStorageUpdateSchema)
  .handler(async ({ data: { gameInstanceId, code, state } }) => {
    const normalizedCode = normalizeJoinCode(code);
    const [auth, gameUser] = await Promise.all([
      getServerAuth(),
      getGameInstanceUser(supabase, gameInstanceId),
    ]);
    if (!auth.user || !gameUser.data || gameUser.data.userId !== auth.user.id)
      throw notFound();
    const redisKey = getJoinCodeRedisKey(normalizedCode);
    const redisReturn = await redis.get(redisKey);
    if (!redisReturn) throw notFound();

    const {
      data: existingData,
      success: parseSuccess,
      error: parseError,
    } = redisCodeStorageSchema.safeParse(JSON.parse(redisReturn));

    if (!parseSuccess)
      throw Error(
        'Problem parsing existing redis data in updateJoinCode',
        parseError,
      );

    if (existingData.gameInstanceId !== gameInstanceId) {
      throw Error('Join code does not match the game instance being updated');
    }

    const nextData = redisCodeStorageSchema.parse({
      ...existingData,
      code: normalizedCode,
      state: {
        ...existingData.state,
        ...state,
      },
    });

    await redis.set(redisKey, JSON.stringify(nextData), 'KEEPTTL');
  });

export const getJoinCodeGame = createServerFn({ method: 'GET' })
  .validator(getJoinCodeGameRPCSchema)
  .handler(async ({ data: { code: inputCode } }) => {
    const code = normalizeJoinCode(inputCode);
    const redisReturn = await redis.get(getJoinCodeRedisKey(code));
    if (!redisReturn) throw notFound();
    const { data, error, success } = redisCodeStorageSchema.safeParse(
      JSON.parse(redisReturn),
    );
    if (!success) throw Error(error.message, { cause: 'Redis schema invalid' });

    return data;
  });

export const deleteJoinCode = createServerFn({ method: 'POST' })
  .validator(getJoinCodeGameRPCSchema)
  .handler(async ({ data }) => {
    const auth = await getServerAuth();
    if (!auth.user) throw notFound();
    const code = normalizeJoinCode(data.code);

    const { data: instance } = await supabase
      .from('game_instance')
      .select('id, userid')
      .eq('join_code', code)
      .maybeSingle()
      .throwOnError();

    if (!instance || instance.userid !== auth.user.id) throw notFound();

    await supabase
      .from('game_realtime_viewers')
      .delete()
      .eq('game_instance_id', instance.id)
      .throwOnError();
    await supabase
      .from('game_instance')
      .update({ join_code: null, join_code_expires: null })
      .eq('id', instance.id)
      .throwOnError();

    const success = !!(await redis.del([getJoinCodeRedisKey(code)]));
    return { success };
  });

export const authorizeRealtimeViewer = createServerFn({ method: 'POST' })
  .validator(getJoinCodeGameRPCSchema)
  .handler(async ({ data: { code: inputCode } }) => {
    const authClient = createSupabaseServerClient();
    const { data: claims, error } = await authClient.auth.getClaims();

    if (error || !claims?.claims.sub) throw notFound();

    const code = normalizeJoinCode(inputCode);
    const redisReturn = await redis.get(getJoinCodeRedisKey(code));
    if (!redisReturn) throw notFound();

    let parsedRedis: unknown;
    try {
      parsedRedis = JSON.parse(redisReturn);
    } catch {
      throw notFound();
    }
    const cached = redisCodeStorageSchema.safeParse(parsedRedis);
    if (!cached.success) throw notFound();

    const { data: instance } = await supabase
      .from('game_instance')
      .select('id, userid, join_code, join_code_expires')
      .eq('id', cached.data.gameInstanceId)
      .eq('join_code', code)
      .gt('join_code_expires', new Date().toISOString())
      .maybeSingle()
      .throwOnError();

    if (!instance?.join_code_expires) throw notFound();

    if (instance.userid !== claims.claims.sub) {
      await supabase
        .from('game_realtime_viewers')
        .upsert({
          user_id: claims.claims.sub,
          game_instance_id: instance.id,
          expires_at: instance.join_code_expires,
        })
        .throwOnError();
    }

    return { gameInstanceId: instance.id };
  });
