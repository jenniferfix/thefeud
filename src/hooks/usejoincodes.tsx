import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { deleteJoinCode, getJoinCodeGame } from '#/server/joincodes';

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
      return (await getJoinCodeGame({ data: { code } })) ?? null;
    },
  });

export const useGetJoinCodeGame = (code: string) => {
  return useQuery(getJoinCodeGameQueryOption(code));
};

export const useJoinGame = () => {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      try {
        const joinCodeRes = await getJoinCodeGame({ data: { code } });
        if (joinCodeRes.state.gameover) return null;
        return joinCodeRes;
      } catch (error) {
        console.error("Couldn't get join code", error);
        return null;
      }
    },
  });
};
