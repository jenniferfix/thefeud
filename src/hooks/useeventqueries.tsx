'use client';
import {
  queryOptions,
  useMutation,
  useQueryClient,
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

    queryFn: async (opts) =>
      (await getEventsForGameInstance(supabase, instanceId)).data ?? null,
  });

export const useGetEventsForGameInstance = (instanceId: string) => {
  return useSuspenseQuery(getEventsForGameInstanceQueryOptions(instanceId));
};

export const useInsertEvent = (instanceId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const mutationFn = async (
    event: Database['public']['Tables']['game_events']['Insert'],
  ) => {
    return (await insertEvent(client, event)).data ?? null;
  };
  const onSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: getEventsForGameInstanceQueryKey(instanceId),
    });
  };
  return useMutation({ mutationFn, onSuccess });
};
