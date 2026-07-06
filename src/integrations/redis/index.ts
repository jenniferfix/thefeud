import Valkey, { type RedisOptions } from 'iovalkey';

let redis: Valkey | undefined;
let redisSub: Valkey | undefined;

export const getRedisPrefix = (): string => {
  return process.env.REDIS_PREFIX ?? 'feudgame';
};

export const getJoinCodeRedisKey = (code: string): string => {
  return `${getRedisPrefix()}:joincode:${code}`;
};

export const createRedisClient = (params?: RedisOptions) => {
  redis = new Valkey({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_DOMAIN,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
      return Math.min(times * 50, 30000); // Retry up to 30 seconds
    },
    ...params,
  });

  redis.on('error', (err) => {
    console.error('Redis connection error: ', err);
  });

  redis.on('connect', () => {
    console.log('Redis client connected');
  });

  redis.on('reconnecting', () => {
    console.log('Redis client reconnecting');
  });

  return redis;
};

export const createRedisSubClient = (params?: RedisOptions) => {
  redisSub = new Valkey({
    host: process.env.REDIS_DOMAIN,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
      return Math.min(times * 50, 30000); // Retry up to 30 seconds
    },
    ...params,
  });

  redisSub.on('error', (err) => {
    console.error('Redis sub connection error: ', err);
  });

  redisSub.on('connect', () => {
    console.log('Redis sub client connected');
  });

  redisSub.on('reconnecting', () => {
    console.log('Redis sub client reconnecting');
  });

  return redisSub;
};

export const getRedisClient = () => {
  if (redis) return redis;
  else return createRedisClient();
};

export const getRedisSubClient = () => {
  if (redisSub) return redisSub;
  else return createRedisSubClient();
};

export type RedisClient = ReturnType<typeof createRedisClient>;
export type RedisSubClient = ReturnType<typeof createRedisSubClient>;
