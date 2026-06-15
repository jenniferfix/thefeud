import { PostgrestError } from '@supabase/supabase-js';
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { produce } from 'immer';
import { useSupabaseAuth } from '#/supabaseauth';
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

export const getGamesQueryKey = () => ['allgames'] as const;

export const getGamesQueryOptions = () =>
  queryOptions({
    queryKey: getGamesQueryKey(),
    queryFn: async () => (await getGames(supabase)) ?? null,
  });

export function useGetGames() {
  return useSuspenseQuery(getGamesQueryOptions());
}

export const getUserGamesQueryKey = () => ['games'];

export const getUserGamesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: getUserGamesQueryKey(),
    queryFn: async () => {
      return (await getUserGames(supabase, userId)).data ?? null;
    },
  });

export const useGetUserGames = (userId: string) => {
  return useSuspenseQuery(getUserGamesQueryOptions(userId));
};

export const getGameQuestionsQueryKey = (gameId: string) => [
  'gamequestions',
  gameId,
];

export const getGameQuestionsQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: getGameQuestionsQueryKey(gameId),
    queryFn: async () =>
      (await getGameQuestions(supabase, gameId)).data ?? null,
  });

export function useGetGameQuestions(gameId: string) {
  return useSuspenseQuery(getGameQuestionsQueryOptions(gameId));
}

export function useAddQuestionToGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      questionId,
      gameId,
    }: {
      questionId: string;
      gameId: string;
    }) => (await addQuestionToGame(supabase, questionId, gameId)).data ?? null,

    onSettled: async (
      _data,
      _error,
      { questionId, gameId },
      _result,
      { client },
    ) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        client.invalidateQueries({
          queryKey: getGameQuestionsQueryKey(gameId),
        }),
        client.invalidateQueries({
          queryKey: getUserGamesQueryKey(),
        }),
      ]);
    },
  });
}

export function useRemoveQuestionFromGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      questionId,
      gameId,
    }: {
      questionId: string;
      gameId: string;
    }) => {
      return (
        (await removeQuestionFromGame(supabase, questionId, gameId)).data ??
        null
      );
    },
    onSettled: async (
      _data,
      _error,
      { gameId, questionId },
      _result,
      { client },
    ) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        client.invalidateQueries({
          queryKey: getGameQuestionsQueryKey(gameId),
        }),
        client.invalidateQueries({
          queryKey: getUserGamesQueryKey(),
        }),
      ]);
    },
  });
}

export function useInsertGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      return (await insertGame(supabase, name)).data ?? null;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: ['games'] }),
      ]);
    },
  });
}

export function useDeleteGame() {
  return useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      return (await deleteGame(supabase, gameId)).data ?? null;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getUserGamesQueryKey() }),
      ]);
    },
  });
}

export function useUpdateGame() {
  return useMutation({
    mutationFn: async ({ gameId, name }: { gameId: string; name: string }) => {
      return (await updateGame(supabase, gameId, name)).data ?? null;
    },
    onMutate: async ({ gameId, name }, { client }) => {
      await Promise.allSettled([
        client.cancelQueries({ queryKey: getGamesQueryKey() }),
        client.cancelQueries({ queryKey: getGameQueryKey(gameId) }),
      ]);
      const previous = client.getQueryData(getGameQueryKey(gameId));
      // TODO: Finish
    },
    onSettled: async (_data, _error, { gameId }, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getUserGamesQueryKey() }),
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        client.invalidateQueries({ queryKey: getGamesQueryKey() }),
      ]);
    },
    onError: () => {
      //
    },
  });
}
