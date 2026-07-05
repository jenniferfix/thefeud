import {
  type GameEvent,
  gameEventSchema,
} from '#/lib/schemas/events';
import {
  getRedisClient,
  getRedisPrefix,
  getRedisSubClient,
} from './index';

export type GameEventListener = (event: GameEvent) => void;

const listeners = new Map<string, Set<GameEventListener>>();
let subscriptionPromise: Promise<unknown> | undefined;
let messageHandlerAttached = false;

export const getGameEventRedisChannel = (gameInstanceId: string): string => {
  return `${getRedisPrefix()}:game:${gameInstanceId}:events`;
};

export const getGameEventRedisPattern = (): string => {
  return `${getRedisPrefix()}:game:*:events`;
};

const removeListener = (channel: string, listener: GameEventListener) => {
  const channelListeners = listeners.get(channel);
  if (!channelListeners) return;

  channelListeners.delete(listener);
  if (channelListeners.size === 0) listeners.delete(channel);
};

const handleMessage = (_pattern: string, channel: string, message: string) => {
  let payload: unknown;

  try {
    payload = JSON.parse(message);
  } catch (error) {
    console.error('Invalid Redis game event JSON', error);
    return;
  }

  const result = gameEventSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid Redis game event payload', result.error);
    return;
  }

  for (const listener of listeners.get(channel) ?? []) {
    try {
      listener(result.data);
    } catch (error) {
      console.error('Redis game event listener failed', error);
    }
  }
};

const ensureGameEventSubscription = async () => {
  const subscriber = getRedisSubClient();

  if (!messageHandlerAttached) {
    subscriber.on('pmessage', handleMessage);
    messageHandlerAttached = true;
  }

  subscriptionPromise ??= subscriber
    .psubscribe(getGameEventRedisPattern())
    .catch((error) => {
      subscriptionPromise = undefined;
      throw error;
    });

  await subscriptionPromise;
};

export const subscribeToGameEvents = async (
  gameInstanceId: string,
  listener: GameEventListener,
): Promise<() => void> => {
  const channel = getGameEventRedisChannel(gameInstanceId);
  const channelListeners = listeners.get(channel) ?? new Set();
  channelListeners.add(listener);
  listeners.set(channel, channelListeners);

  try {
    await ensureGameEventSubscription();
  } catch (error) {
    removeListener(channel, listener);
    throw error;
  }

  return () => removeListener(channel, listener);
};

export const publishGameEvent = async (
  gameInstanceId: string,
  event: GameEvent,
): Promise<number> => {
  const payload = gameEventSchema.parse(event);
  return await getRedisClient().publish(
    getGameEventRedisChannel(gameInstanceId),
    JSON.stringify(payload),
  );
};
