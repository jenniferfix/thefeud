import {
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { CreateGameInstance } from '#/lib/schemas/gameInstance';
import { useAuthenticatedUser } from '#/supabaseauth';
import type { TypedSupabaseClient } from '#/utils/supabase/client';
import { useSupabase } from '@/hooks/useSupabase';
import {
  createGameInstance,
  deleteGameInstance,
  getActiveInstances,
  getGameInstance,
  getUserInstances,
  markFinished,
} from '@/queries/instancequeries';
import { createJoinCode } from '@/server/joincodes';

const getGameInstancesQueryKey = () => ['gameinstances'];

export function useCreateGameInstance() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async (values: CreateGameInstance) => {
      const gameInstance =
        (await createGameInstance(supabase, values)).data ?? null;
      if (!gameInstance) throw Error('Failed to create game instance');
      await createJoinCode({
        data: {
          use: 'watch',
          gameInstanceId: gameInstance.id,
        },
      });
      return gameInstance;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameInstancesQueryKey() }),
      ]);
    },
  });
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

export const getGetGameInstanceQueryKey = (instanceId: string) =>
  ['gameinstancegame', instanceId] as const;

export const getGameInstanceQueryOptions = (
  supabase: TypedSupabaseClient,
  instanceId: string,
) => {
  return queryOptions({
    queryKey: getGetGameInstanceQueryKey(instanceId),
    queryFn: async () =>
      (await getGameInstance(supabase, instanceId)).data ?? null,
  });
};

export function useGetGameInstance(instanceId: string) {
  const supabase = useSupabase();
  return useSuspenseQuery(getGameInstanceQueryOptions(supabase, instanceId));
}

export const getActiveInstancesQueryOptions = (supabase: TypedSupabaseClient) =>
  queryOptions({
    queryKey: ['activeinstances'],
    queryFn: async () => (await getActiveInstances(supabase)).data ?? null,
  });

export function useGetActiveInstances() {
  const supabase = useSupabase();
  return useQuery(getActiveInstancesQueryOptions(supabase));
}

export const getUserInstancesQueryKey = (
  userId: string,
  finished?: boolean,
) => ['instances', userId, finished];

export const getUserInstancesQueryOptions = (
  supabase: TypedSupabaseClient,
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
  const supabase = useSupabase();
  return useQuery(getUserInstancesQueryOptions(supabase, userId, finished));
}

export function useMarkInstanceFinished() {
  const supabase = useSupabase();
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
          queryKey: getGetGameInstanceQueryKey(gameInstanceId),
        }),
      ]);
    },
  });
}
