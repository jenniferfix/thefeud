import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { normalizeToArray } from '#/lib/utils';
import type { AnswersInsert } from '@/queries/answerqueries';
import {
  deleteAnswer,
  getAnswersByQuestionId,
  insertAnswer,
  updateAnswer,
} from '@/queries/answerqueries';
import type { Database, Tables } from '@/types/supabase.types';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import {
  getQuestionQueryKey,
  getQuestionsQueryKey,
} from './usequestionqueries';

const supabase = getSupabaseBrowserClient();

export const getAnswersByQuestionIdQueryKey = (questionId: string) => [
  'answers',
  questionId,
];

export const getAnswersByQuestionIdQueryOptions = (questionId: string) =>
  queryOptions({
    queryKey: getAnswersByQuestionIdQueryKey(questionId),
    queryFn: async () =>
      (await getAnswersByQuestionId(supabase, questionId)).data ?? null,
  });

export function useGetAnswersByQuestionId(questionId: string) {
  return useQuery(getAnswersByQuestionIdQueryOptions(questionId));
}

export function useUpdateAnswerMutation() {
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
  return useMutation({
    mutationFn: async (data: AnswersInsert | AnswersInsert[]) => {
      return (
        (await insertAnswer(supabase, normalizeToArray(data))).data ?? null
      );
    },
    onSettled: async (data, _error, _answers, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getQuestionsQueryKey() }),
        client.invalidateQueries({ queryKey: ['answers'] }),
        data
          ? client.invalidateQueries({
              queryKey: getQuestionQueryKey(data[0].question_id),
            })
          : undefined,
      ]);
    },
  });
}

export function useDeleteAnswer() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return (await deleteAnswer(supabase, id)).data ?? null;
    },
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: ['answers'] }),
      ]);
    },
  });
}
