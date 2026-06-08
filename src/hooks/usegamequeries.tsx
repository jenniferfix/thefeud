import { PostgrestError } from '@supabase/supabase-js';
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { produce } from 'immer';
import useSupabase from '@/hooks/useSupabase';
import {
  addQuestionToGame,
  deleteGame,
  getGame,
  getGameQuestions,
  getGames,
  getUserGames,
  insertGame,
  removeQuestionFromGame,
  updateGame,
} from '@/queries/gamequeries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

type QueryError = {
  message: string;
  originalError: PostgrestError;
};

const handQueryError = (error: PostgrestError): QueryError => ({
  message: error.message || 'An error occurred while fetching data',
  originalError: error,
});

const supabase = getSupabaseBrowserClient();

export const getGameQueryKey = (gameId: string) => ['game', gameId] as const;

export const getGameQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: getGameQueryKey(gameId),
    queryFn: async () => (await getGame(supabase, gameId)).data ?? null,
  });

export const useGetGame = (gameId: string) => {
  return useSuspenseQuery(getGameQueryOptions(gameId));
};

export const getGamesQueryKey = () => ['games'] as const;

export const getGamesQueryOptions = () =>
  queryOptions({
    queryKey: getGamesQueryKey(),
    queryFn: async () => (await getGames(supabase)) ?? null,
  });

export function useGetGames() {
  return useQuery(getGamesQueryOptions());
}

export const getUserGamesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['games', userId],
    queryFn: async () => {
      return (await getUserGames(supabase, userId)).data;
    },
  });

export const useGetUserGames = (userId: string) => {
  return useQuery(getUserGamesQueryOptions(userId));
};

export const getGameQuestionsQueryOptions = (gameid: string) =>
  queryOptions({
    queryKey: ['gamequestions', gameid],
    queryFn: async () =>
      (await getGameQuestions(supabase, gameid)).data ?? null,
  });

export function useGetGameQuestions(gameId: string) {
  return useQuery(getGameQuestionsQueryOptions(gameId));
}

export function useAddQuestionToGame(gameId: string) {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = ['gamequestions', gameId];
  const mutationFn = async ({ questionId }: { questionId: string }) => {
    return addQuestionToGame(client, questionId, gameId);
  };
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };
  return useMutation({ mutationFn, onSuccess });
}

export function useRemoveQuestionFromGame(gameId: string) {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = ['gamequestions', gameId];
  const mutationFn = async ({ questionId }: { questionId: string }) => {
    return removeQuestionFromGame(client, questionId, gameId);
  };
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };
  return useMutation({ onSuccess, mutationFn });
}

export function useInsertGame() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  const mutationFn = async ({ name }: { name: string }) => {
    return insertGame(client, name);
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['games'] });
  };

  return useMutation({ mutationFn, onSuccess });
}

export function useUpdateGame() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  const queryKey = ['games'] as const;

  const mutationFn = async ({
    gameId,
    name,
  }: {
    gameId: string;
    name: string;
  }) => {
    return updateGame(client, gameId, name);
  };

  return useMutation({
    mutationFn,
    onMutate: async ({ gameId, name }) => {
      await Promise.allSettled([
        queryClient.cancelQueries({ queryKey: getGamesQueryKey() }),
        queryClient.cancelQueries({ queryKey: getGameQueryKey(gameId) }),
      ]);
      const previous = queryClient.getQueryData(queryKey);
      // TODO: Finish
    },
    onSettled: async (_data, _error, { gameId }, _context) => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        queryClient.invalidateQueries({ queryKey: getGamesQueryKey() }),
      ]);
    },
    onError: () => {
      //
    },
  });
}

export const deleteGameMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      return deleteGame(supabase, gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export function useDeleteGame() {
  return useMutation(deleteGameMutationOptions());
}
