import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { mergeGameBoardStateIntoGameInstance } from '#/lib/gameboard-state';
import type { BackendEventType } from '#/lib/schemas/eventsbackend';
import { processEvent } from '#/server/events';
import type { TypedSupabaseClient } from '#/utils/supabase/client';
import { getGetGameInstanceQueryKey } from '@/hooks/useinstancequeries';
import { getEventsForGameInstance } from '@/queries/eventqueries';
import type { GameInstance } from '@/queries/instancequeries';
import { useSupabase } from './useSupabase';

export const getEventsForGameInstanceQueryKey = (instanceId: string) => [
  'GameInstanceEvents',
  instanceId,
];

export const getEventsForGameInstanceQueryOptions = (
  supabase: TypedSupabaseClient,
  instanceId: string,
) =>
  queryOptions({
    queryKey: getEventsForGameInstanceQueryKey(instanceId),

    queryFn: async () =>
      (await getEventsForGameInstance(supabase, instanceId)).data ?? null,
  });

export const useGetEventsForGameInstance = (instanceId: string) => {
  const supabase = useSupabase();
  return useSuspenseQuery(
    getEventsForGameInstanceQueryOptions(supabase, instanceId),
  );
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
          (current) =>
            current
              ? mergeGameBoardStateIntoGameInstance(current, data.state)
              : current,
        );
      }

      await client.invalidateQueries({
        queryKey: getGetGameInstanceQueryKey(gameInstanceId),
      });
    },
  });
};
