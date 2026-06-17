import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { gameInstanceId } from '#/lib/schemas/joincode';
import {
  createJoinCode,
  deleteJoinCode,
  getJoinCodeGame,
} from '#/server/joincodes';
import { getEventsForGameInstanceQueryKey } from './useeventqueries';
import {
  getInstanceGameQueryKey,
  getUserInstancesQueryKey,
} from './useinstancequeries';

export const useCreateJoinCode = () => {
  return useMutation({
    mutationFn: async ({
      gameInstanceId,
      userId,
    }: {
      gameInstanceId: string;
      userId: string;
    }) => {
      return await createJoinCode({ data: { gameInstanceId } });
    },
    onSettled: async (
      _data,
      _error,
      { gameInstanceId, userId },
      _result,
      { client },
    ) => {
      await Promise.allSettled([
        client.invalidateQueries({
          queryKey: getInstanceGameQueryKey(gameInstanceId),
        }),
        client.invalidateQueries({
          queryKey: getUserInstancesQueryKey(userId),
        }),
      ]);
    },
  });
};

export const useDeleteJoinCode = () => {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      return await deleteJoinCode({ data: { code } });
    },
    onSettled: async (_data, _error, _var, _result, { client }) => {
      await Promise.allSettled([]);
    },
  });
};

export const getJoinCodeGameQueryKey = (code: string) => ['gamebycode', code];

export const getJoinCodeGameQueryOption = (code: string) =>
  queryOptions({
    queryKey: getJoinCodeGameQueryKey(code),
    queryFn: async () => {
      return await getJoinCodeGame({ data: { code } });
    },
  });

export const useGetJoinCodeGame = (code: string) => {
  return useQuery(getJoinCodeGameQueryOption(code));
};

export const useJoinGame = () => {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const joinCodeRes = await getJoinCodeGame({ data: { code } });
      if (!joinCodeRes?.success) return null;
      // TODO: return a redirect path based on the use
      return joinCodeRes.data?.gameInstanceId;
    },
  });
};
