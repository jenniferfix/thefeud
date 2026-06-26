import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { mergeGameBoardStateIntoGameInstance } from '#/lib/gameboard-state';
import type { BackendEventType } from '#/lib/schemas/eventsbackend';
import { processEvent } from '#/server/events';
import { getGetGameInstanceQueryKey } from '@/hooks/useinstancequeries';
import useSupabase from '@/hooks/useSupabase';
import { getEventsForGameInstance, insertEvent } from '@/queries/eventqueries';
import type { GameInstance } from '@/queries/instancequeries';
import type { Database } from '@/types/supabase.types';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

const supabase = getSupabaseBrowserClient();

export const getEventsForGameInstanceQueryKey = (instanceId: string) => [
  'GameInstanceEvents',
  instanceId,
];

export const getEventsForGameInstanceQueryOptions = (instanceId: string) =>
  queryOptions({
    queryKey: getEventsForGameInstanceQueryKey(instanceId),

    queryFn: async () =>
      (await getEventsForGameInstance(supabase, instanceId)).data ?? null,
  });

export const useGetEventsForGameInstance = (instanceId: string) => {
  return useSuspenseQuery(getEventsForGameInstanceQueryOptions(instanceId));
};

export const useProcessEvent = () => {
  return useMutation({
    mutationFn: async (event: BackendEventType) => {
      return await processEvent({ data: event });
    },
    onSuccess: async (data, { gameInstanceId }, _result, { client }) => {
      if (data?.state) {
        client.setQueryData<GameInstance | null>(
          getGetGameInstanceQueryKey(data.gameInstanceId),
          (current) => {
            if (!current) return current;
            return mergeGameBoardStateIntoGameInstance(current, data.state);
          },
        );
      }

      await client.invalidateQueries({
        queryKey: getGetGameInstanceQueryKey(gameInstanceId),
      });
    },
  });
};
export const useInsertEvent = () => {
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      event,
    }: {
      gameInstanceId: string;
      event: Database['public']['Tables']['game_events']['Insert'];
    }) => {
      return (await insertEvent(supabase, event)).data ?? null;
    },
    onSettled: async (
      _data,
      _error,
      { gameInstanceId },
      _result,
      { client },
    ) => {
      await Promise.allSettled([
        client.invalidateQueries({
          queryKey: getEventsForGameInstanceQueryKey(gameInstanceId),
        }),
      ]);
    },
  });
};
