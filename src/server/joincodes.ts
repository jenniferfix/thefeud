import { createServerFn } from '@tanstack/react-start';
import { getRedisClient } from '#/integrations/redis';
import { generateJoinCode } from '#/lib/api/joincodes';
import {
  createJoinCodeRPCSchema,
  redisCodeStorageSchema,
} from '#/lib/schemas/joincode';

const redis = getRedisClient();

const prefix = process.env.REDIS_PREFIX ?? 'feudgame';
const redisPrefix = `${prefix}:joincode:`;

export const getJoinCode = createServerFn({ method: 'GET' })
  .validator(createJoinCodeRPCSchema)
  .handler(async ({ data: { gameInstanceId, use } }) => {
    let finished = false;
    let success = false;
    let attempt = 0;
    const MAX = 5;
    while (!finished) {
      const code = generateJoinCode();
      const insertData = redisCodeStorageSchema.parse({
        code,
        gameInstanceId,
        use: 'watch',
      });
      await redis.set(
        `${redisPrefix}${code}`,
        JSON.stringify(insertData),
        'EX',
        60 * 60 * 24 * 7, // Week
        (err, result) => {
          if (err) {
            attempt + 1;
            if (attempt >= MAX) {
              finished = true;
              throw Error(`Maximum code insert attempts reached: ${attempt}`);
            }
          } else {
            finished = true;
            success = true;
          }
        },
      );
      if (success) return code;
    }
  });
