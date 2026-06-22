import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import {
  createJoinCode,
  deleteJoinCode,
  getJoinCodeGame,
} from '#/server/joincodes';
import {
  getGetGameInstanceQueryKey,
  getUserInstancesQueryKey,
} from './useinstancequeries';

export const useCreateJoinCode = () => {
  return useMutation({
    mutationFn: async ({
      gameInstanceId,
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
          queryKey: getGetGameInstanceQueryKey(gameInstanceId),
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
    // onSettled: async (_data, _error, _var, _result, {0 client }) => {
    //   await Promise.allSettled([]);
    // },
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
