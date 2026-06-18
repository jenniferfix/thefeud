'use client';
import {
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { CreateGameInstance } from '#/lib/schemas/gameInstance';
import { useAuthenticatedUser } from '#/supabaseauth';
import useSupabase from '@/hooks/useSupabase';
import {
  createGameInstance,
  deleteGameInstance,
  getActiveInstances,
  getGameInstance,
  getInstanceGame,
  getUserInstances,
  markFinished,
} from '@/queries/instancequeries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

const supabase = getSupabaseBrowserClient();

const getGameInstancesQueryKey = () => ['gameinstances'];

export function useCreateGameInstance() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async (values: CreateGameInstance) => {
      return (await createGameInstance(supabase, values)).data ?? null;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameInstancesQueryKey() }),
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
        client.invalidateQueries({ queryKey: getGameInstancesQueryKey() }),
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

export const getUserInstancesQueryKey = (
  userId: string,
  finished?: boolean,
) => ['instances', userId, finished];

export const getUserInstancesQueryOptions = (
  userId: string,
  finished?: boolean,
) =>
  queryOptions({
    queryKey: getUserInstancesQueryKey(userId, finished),
    queryFn: async () => {
      return (await getUserInstances(supabase, userId, finished)).data ?? null;
    },
  });

export function useGetUserInstances(userId: string, finished?: boolean) {
  return useQuery(getUserInstancesQueryOptions(userId, finished));
}

export function useMarkInstanceFinished() {
  const { user } = useAuthenticatedUser();
  return useMutation({
    mutationFn: async ({ gameInstanceId }: { gameInstanceId: string }) => {
      return (await markFinished(supabase, gameInstanceId)).data ?? null;
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
          queryKey: getUserInstancesQueryKey(user.id),
        }),
        client.invalidateQueries({
          queryKey: getUserInstancesQueryKey(user.id, false),
        }),
        client.invalidateQueries({
          queryKey: getUserInstancesQueryKey(user.id, true),
        }),
        client.invalidateQueries({ queryKey: ['activeinstances'] }),
        client.invalidateQueries({
          queryKey: getInstanceGameQueryKey(gameInstanceId),
        }),
      ]);
    },
  });
}
