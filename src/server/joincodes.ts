import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRedisClient } from '#/integrations/redis';
import { generateJoinCode, normalizeJoinCode } from '#/lib/api/joincodes';
import { gameboardState } from '#/lib/schemas/gameboard';
import {
  createJoinCodeRPCSchema,
  getJoinCodeGameRPCSchema,
  type RedisCodeStorageType,
  redisCodeStorageSchema,
  redisCodeStorageUpdateSchema,
} from '#/lib/schemas/joincode';
import { createSupabaseServerClient } from '#/utils/supabase/server';
import {
  getGameInstance,
  getGameInstanceUser,
} from '@/queries/instancequeries';
import { getServerAuth } from './auth';

const redis = getRedisClient();
const supabase = createSupabaseServerClient();

const EXPIRE_SECONDS = 60 * 60 * 24 * 7; // Week
const MAX_RETRIES = 5;
const prefix = process.env.REDIS_PREFIX ?? 'feudgame';
const redisPrefix = `${prefix}:joincode:`;

export const createJoinCode = createServerFn({ method: 'GET' })
  .validator(createJoinCodeRPCSchema)
  .handler(
    async ({ data: { gameInstanceId, gameTitle, rightTeam, leftTeam } }) => {
      const auth = await getServerAuth();
      if (!auth.user) return;
      const game = await getGameInstance(supabase, gameInstanceId);
      if (!game.data) throw notFound();
      let finished = false;
      let success = false;
      let attempt = 0;
      while (!finished) {
        const code = generateJoinCode();
        const {
          data: insertData,
          success: parseSuccess,
          error: parseError,
        } = redisCodeStorageSchema.safeParse({
          code,
          gameInstanceId,
          use: 'watch',
          state: {
            gameTitle,
            leftTeam,
            rightTeam,
            answers: {},
          },
        });
        if (!parseSuccess)
          throw Error(
            'Problem parsing initial redis data in createJoinCode',
            parseError,
          );
        const expireTime = new Date(Date.now() + EXPIRE_SECONDS * 1000);

        const res = await redis.set(
          `${redisPrefix}${code}`,
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
          await supabase
            .from('game_instance')
            .update({
              join_code: code,
              join_code_expires: expireTime.toISOString(),
            })
            .eq('id', gameInstanceId)
            .throwOnError();
        }
        return { success, data: success ? code : undefined };
      }
    },
  );

export const updateJoinCode = createServerFn({ method: 'GET' })
  .validator(redisCodeStorageUpdateSchema)
  .handler(async ({ data: { gameInstanceId, code, state } }) => {
    const [auth, gameUser] = await Promise.all([
      getServerAuth(),
      getGameInstanceUser(supabase, gameInstanceId),
    ]);
    if (!auth.user) return;
    if (!gameUser.data) throw notFound();
    console.log('updateredis', gameInstanceId, code, state);
    const {
      data,
      success: parseSuccess,
      error: parseError,
    } = redisCodeStorageUpdateSchema.safeParse({
      code,
      gameInstanceId,
      state,
    });
    if (!parseSuccess)
      throw Error(
        'Problem parsing initial redis data in updateJoinCode',
        parseError,
      );

    await redis.set(`${redisPrefix}${code}`, JSON.stringify(data), 'KEEPTTL');
  });

export const getJoinCodeGame = createServerFn({ method: 'GET' })
  .validator(getJoinCodeGameRPCSchema)
  .handler(async ({ data: { code: inputCode } }) => {
    const code = normalizeJoinCode(inputCode);
    const redisReturn = await redis.get(`${redisPrefix}${code}`);
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
    if (!auth.user) return;
    const code = normalizeJoinCode(data.code);
    const success = !!(await redis.del([code]));
    return { success };
  });
