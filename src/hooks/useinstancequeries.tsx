'use client';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { CreateGameInstance } from '#/lib/schemas/gameInstance';
import useSupabase from '@/hooks/useSupabase';
import {
  createGameInstance,
  deleteGameInstance,
  getActiveInstances,
  getGameInstance,
  getInstanceGame,
  getUserInstances,
} from '@/queries/instancequeries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

const supabase = getSupabaseBrowserClient();

export function useCreateGameInstance() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async (values: CreateGameInstance) => {
      return (await createGameInstance(supabase, values)).data ?? null;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: ['gameInstances'] }),
      ]);
    },
  });
}

export function useGetGameInstance(instanceId: string) {
  const client = useSupabase();
  const queryKey = ['gameInstance', instanceId];
  const queryFn = async () => {
    return (await getGameInstance(client, instanceId)).data ?? null;
  };
  return useQuery({ queryKey, queryFn });
}

export function useDeleteGameInstance() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ instanceId }: { instanceId: string }) => {
      return await deleteGameInstance(supabase, instanceId);
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: ['gameInstances'] }),
      ]);
    },
  });
}

export const getInstanceGameQueryKey = (instanceId: string) =>
  ['gameinstancegame', instanceId] as const;

export const getInstanceGameQueryOptions = (instanceId: string) => {
  return queryOptions({
    queryKey: getInstanceGameQueryKey(instanceId),
    queryFn: async () =>
      (await getInstanceGame(supabase, instanceId)).data ?? null,
  });
};

export function useGetInstanceGame(instanceId: string) {
  return useSuspenseQuery(getInstanceGameQueryOptions(instanceId));
}

export const getActiveInstancesQueryOptions = () =>
  queryOptions({
    queryKey: ['activeinstances'],
    queryFn: async () => (await getActiveInstances(supabase)).data ?? null,
  });

export function useGetActiveInstances() {
  return useQuery(getActiveInstancesQueryOptions());
}

const getUserInstancesQueryKey = () => ['instances'];

export const getUserInstancesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: getUserInstancesQueryKey(),
    queryFn: async () => {
      return (await getUserInstances(supabase, userId)).data ?? null;
    },
  });

export function useGetUserInstances(userId: string) {
  return useQuery(getUserInstancesQueryOptions(userId));
}
