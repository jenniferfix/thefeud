'use client';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
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
  const client = useSupabase();
  const queryClient = useQueryClient();
  const mutationFn = async ({ gameId }: { gameId: string }) => {
    return (await createGameInstance(client, gameId)).data ?? undefined;
  };
  const onSuccess = async () => {
    queryClient.invalidateQueries({ queryKey: ['gameInstances'] }); //
  };
  return useMutation({ mutationFn, onSuccess });
}

export function useGetGameInstance(instanceId: string) {
  const client = useSupabase();
  const queryKey = ['gameInstance', instanceId];
  const queryFn = async () => {
    return await getGameInstance(client, instanceId);
  };
  return useQuery({ queryKey, queryFn });
}

export function useDeleteGameInstance() {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const mutationFn = async ({ instanceId }: { instanceId: string }) => {
    return await deleteGameInstance(client, instanceId);
  };
  const onSuccess = async () => {
    queryClient.invalidateQueries({ queryKey: ['gameInstances'] });
  };
  return useMutation({ mutationFn, onSuccess });
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

export function useGetActiveInstances() {
  const client = useSupabase();
  const queryKey = ['activeinstances'];
  const queryFn = async () => {
    return getActiveInstances(client).then((result) => result?.data);
  };
  return useQuery({ queryKey, queryFn });
}

export const getActiveInstancesQueryOptions = queryOptions({
  queryKey: ['activeinstances'],
  queryFn: async () => (await getActiveInstances(supabase)) ?? null,
});

export function useGetUserInstances(userId: string) {
  const client = useSupabase();
  const queryKey = ['activeinstances'];
  const queryFn = async () => {
    return getUserInstances(client, userId).then((result) => result?.data);
  };
  return useQuery({ queryKey, queryFn });
}

export const getUserInstancesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['activeinstances'],
    queryFn: async () =>
      getUserInstances(supabase, userId).then((result) => result?.data),
  });
