import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { TypedSupabaseClient } from '#/utils/supabase/client';
import {
  addQuestionToGame,
  deleteGame,
  getGame,
  // getGameQuestions,
  getUserGames,
  insertGame,
  removeQuestionFromGame,
  updateGame,
  updateQuestionForGame,
} from '@/queries/gamequeries';
import { useSupabase } from './useSupabase';

export const getGameQueryKey = (gameId: string) => ['game', gameId] as const;

export const getGameQueryOptions = (
  supabase: TypedSupabaseClient,
  gameId: string,
) =>
  queryOptions({
    queryKey: getGameQueryKey(gameId),
    queryFn: async () => (await getGame(supabase, gameId)).data ?? null,
  });

export const useGetGame = (gameId: string) => {
  const supabase = useSupabase();
  return useSuspenseQuery(getGameQueryOptions(supabase, gameId));
};

export const getAllGamesQueryKey = () => ['games'];

export const getAllGamesQueryOptions = (supabase: TypedSupabaseClient) =>
  queryOptions({
    queryKey: getAllGamesQueryKey(),
    queryFn: async () => {
      return (await getUserGames(supabase)).data ?? null;
    },
  });

export const useGetAllGames = () => {
  const supabase = useSupabase();
  return useSuspenseQuery(getAllGamesQueryOptions(supabase));
};

// export const getGameQuestionsQueryKey = (gameId: string) => [
//   'gamequestions',
//   gameId,
// ];
//
// export const getGameQuestionsQueryOptions = (gameId: string) =>
//   queryOptions({
//     queryKey: getGameQuestionsQueryKey(gameId),
//     queryFn: async () =>
//       (await getGameQuestions(supabase, gameId)).data ?? null,
//   });
//
// export function useGetGameQuestions(gameId: string) {
//   return useSuspenseQuery(getGameQuestionsQueryOptions(gameId));
// }

export function useAddQuestionToGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      questionId,
      gameId,
      position,
    }: {
      questionId: string;
      gameId: string;
      position: string;
    }) =>
      (await addQuestionToGame(supabase, questionId, gameId, position)).data ??
      null,

    onSettled: async (data, _error, { gameId }, _result, { client }) => {
      if (!data?.userId) return;
      await Promise.all([
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        // client.invalidateQueries({
        //   queryKey: getGameQuestionsQueryKey(gameId),
        // }),
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
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
    onSettled: async (data, _error, { gameId }, _result, { client }) => {
      if (!data) return;
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        // client.invalidateQueries({
        //   queryKey: getGameQuestionsQueryKey(gameId),
        // }),
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
        }),
      ]);
    },
  });
}

export function useUpdateQuestionForGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      questionId,
      gameId,
      position,
    }: {
      questionId: string;
      gameId: string;
      position: string;
    }) => {
      return (
        (
          await updateQuestionForGame(supabase, questionId, gameId, {
            position,
          })
        ).data ?? null
      );
    },
    onSettled: async (data, _error, { gameId }, _result, { client }) => {
      if (!data) return;
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        // client.invalidateQueries({
        //   queryKey: getGameQuestionsQueryKey(gameId),
        // }),
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
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
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      return (await deleteGame(supabase, gameId)).data ?? null;
    },
    onSettled: async (data, _error, _variables, _result, { client }) => {
      if (!data) return;
      await Promise.allSettled([
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
        }),
      ]);
    },
  });
}

export function useUpdateGame() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ gameId, name }: { gameId: string; name: string }) => {
      return (await updateGame(supabase, gameId, name)).data ?? null;
    },
    onMutate: async ({ gameId }, { client }) => {
      await Promise.allSettled([
        client.cancelQueries({ queryKey: getAllGamesQueryKey() }),
        client.cancelQueries({ queryKey: getGameQueryKey(gameId) }),
      ]);
      //const previous = client.getQueryData(getGameQueryKey(gameId));
      // TODO: Finish
    },
    onSettled: async (data, _error, { gameId }, _result, { client }) => {
      if (!data) return;
      await Promise.allSettled([
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
        }),
        client.invalidateQueries({ queryKey: getGameQueryKey(gameId) }),
        client.invalidateQueries({
          queryKey: getAllGamesQueryKey(),
        }),
      ]);
    },
    onError: () => {
      //
    },
  });
}
