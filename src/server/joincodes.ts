import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRedisClient } from '#/integrations/redis';
import { generateJoinCode, normalizeJoinCode } from '#/lib/api/joincodes';
import {
  createJoinCodeRPCSchema,
  getJoinCodeGameRPCSchema,
  redisCodeStorageSchema,
} from '#/lib/schemas/joincode';
import { createSupabaseServerClient } from '#/utils/supabase/server';
import { getGameInstance } from '@/queries/instancequeries';
import { getServerAuth } from './auth';

const redis = getRedisClient();
const supabase = createSupabaseServerClient();

const EXPIRE_SECONDS = 60 * 60 * 24 * 7; // Week
const MAX_RETRIES = 5;
const prefix = process.env.REDIS_PREFIX ?? 'feudgame';
const redisPrefix = `${prefix}:joincode:`;

export const createJoinCode = createServerFn({ method: 'GET' })
  .validator(createJoinCodeRPCSchema)
  .handler(async ({ data: { gameInstanceId } }) => {
    const auth = await getServerAuth();
    console.log(auth);
    if (!auth.user) return;
    const game = await getGameInstance(supabase, gameInstanceId);
    if (!game.data) throw notFound();
    let finished = false;
    let success = false;
    let attempt = 0;
    while (!finished) {
      const code = generateJoinCode();
      const insertData = redisCodeStorageSchema.parse({
        code,
        gameInstanceId,
        use: 'watch',
      });
      const expireTime = new Date(Date.now() + EXPIRE_SECONDS * 1000);

      await redis.set(
        `${redisPrefix}${code}`,
        JSON.stringify(insertData),
        'EX',
        EXPIRE_SECONDS, // Week
        (err, _result) => {
          if (err) {
            attempt + 1;
            if (attempt >= MAX_RETRIES) {
              finished = true;
              throw Error(`Maximum code insert attempts reached: ${attempt}`);
            }
          } else {
            finished = true;
            success = true;
          }
        },
      );

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
  });

export const getJoinCodeGame = createServerFn({ method: 'GET' })
  .validator(getJoinCodeGameRPCSchema)
  .handler(async ({ data: { code: inputCode } }) => {
    try {
      const code = normalizeJoinCode(inputCode);
      const redisReturn = await redis.get(`${redisPrefix}${code}`);
      if (!redisReturn) throw notFound();
      const { data, error, success } = redisCodeStorageSchema.safeParse(
        JSON.parse(redisReturn),
      );
      if (!success)
        throw Error(error.message, { cause: 'Redis schema invalid' });

      return { success, data: success ? data : undefined };
    } catch (error) {
      console.error(error);
    }
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
