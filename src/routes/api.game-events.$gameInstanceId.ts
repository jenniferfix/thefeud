import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { subscribeToGameEvents } from '#/integrations/redis/game-events';

const gameInstanceIdSchema = z.uuid();
const encoder = new TextEncoder();
const HEARTBEAT_INTERVAL_MS = 15_000;

export const createGameEventsResponse = (
  request: Request,
  gameInstanceId: string,
): Response => {
  const result = gameInstanceIdSchema.safeParse(gameInstanceId);
  if (!result.success) {
    return new Response('Invalid game instance ID', { status: 400 });
  }

  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;
  let stopped = false;
  let abortHandler: (() => void) | undefined;

  const dispose = () => {
    if (stopped) return;
    stopped = true;

    if (heartbeat) clearInterval(heartbeat);
    unsubscribe?.();
    if (abortHandler) {
      request.signal.removeEventListener('abort', abortHandler);
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (value: string) => {
        if (!stopped) controller.enqueue(encoder.encode(value));
      };

      abortHandler = () => {
        dispose();
        try {
          controller.close();
        } catch {
          // The response may already have been closed by the runtime.
        }
      };
      request.signal.addEventListener('abort', abortHandler, { once: true });

      enqueue('retry: 3000\n\n');
      heartbeat = setInterval(
        () => enqueue(': keep-alive\n\n'),
        HEARTBEAT_INTERVAL_MS,
      );

      try {
        const stopSubscription = await subscribeToGameEvents(
          result.data,
          (event) => enqueue(`data: ${JSON.stringify(event)}\n\n`),
        );

        if (stopped) stopSubscription();
        else unsubscribe = stopSubscription;
      } catch (error) {
        console.error('Failed to subscribe to Redis game events', error);
        if (!stopped) {
          dispose();
          controller.error(error);
        }
      }
    },
    cancel() {
      dispose();
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
};

export const Route = createFileRoute('/api/game-events/$gameInstanceId')({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        createGameEventsResponse(request, params.gameInstanceId),
    },
  },
});
