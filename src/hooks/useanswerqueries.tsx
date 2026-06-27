import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { normalizeToArray } from '#/lib/utils';
import type { TypedSupabaseClient } from '#/utils/supabase/client';
import type { AnswersInsert } from '@/queries/answerqueries';
import {
  deleteAnswer,
  getAnswersByQuestionId,
  insertAnswer,
  updateAnswer,
} from '@/queries/answerqueries';
import type { Database } from '@/types/supabase.types';
import {
  getAllQuestionsQueryKey,
  getQuestionQueryKey,
} from './usequestionqueries';
import { useSupabase } from './useSupabase';

export const getAnswersByQuestionIdQueryKey = (questionId: string) => [
  'answers',
  questionId,
];

export const getAnswersByQuestionIdQueryOptions = (
  supabase: TypedSupabaseClient,
  questionId: string,
) =>
  queryOptions({
    queryKey: getAnswersByQuestionIdQueryKey(questionId),
    queryFn: async () =>
      (await getAnswersByQuestionId(supabase, questionId)).data ?? null,
  });

export function useGetAnswersByQuestionId(questionId: string) {
  const supabase = useSupabase();
  return useSuspenseQuery(
    getAnswersByQuestionIdQueryOptions(supabase, questionId),
  );
}

export function useUpdateAnswer() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Database['public']['Tables']['answers']['Update'];
    }) => {
      return (await updateAnswer(supabase, { id, data })).data;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({
          // queryKey: getAnswersByQuestionIdQueryKey(questionId),
        }),
        // client.invalidateQueries({ queryKey: ['answer', answerid] })
      ]);
    },
  });
}

export function useInsertAnswer() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async (data: AnswersInsert | AnswersInsert[]) => {
      return (
        (await insertAnswer(supabase, normalizeToArray(data))).data ?? null
      );
    },
    onSettled: async (data, _error, _answers, _result, { client }) => {
      if (!data?.length) return;
      const question_id = data[0].question_id;
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getAllQuestionsQueryKey() }),
        client.invalidateQueries({
          queryKey: getQuestionQueryKey(question_id),
        }),
        client.invalidateQueries({
          queryKey: getAnswersByQuestionIdQueryKey(question_id),
        }),
        client.invalidateQueries({
          queryKey: getQuestionQueryKey(question_id),
        }),
      ]);
    },
  });
}

export function useDeleteAnswer() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ id }: { id: string | string[] }) => {
      return (await deleteAnswer(supabase, normalizeToArray(id))).data ?? null;
    },
    onSettled: async (data, _error, _variables, _result, { client }) => {
      if (!data?.length) return;
      const question_id = data[0].question_id;

      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getAllQuestionsQueryKey() }),
        client.invalidateQueries({
          queryKey: getQuestionQueryKey(question_id),
        }),
        client.invalidateQueries({
          queryKey: getAnswersByQuestionIdQueryKey(question_id),
        }),
        client.invalidateQueries({
          queryKey: getQuestionQueryKey(question_id),
        }),
      ]);
    },
  });
}
