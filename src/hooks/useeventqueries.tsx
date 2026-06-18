'use client';
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import useSupabase from '@/hooks/useSupabase';
import { getEventsForGameInstance, insertEvent } from '@/queries/eventqueries';
import { Database } from '@/types/supabase.types';
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
