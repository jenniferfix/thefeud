import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { TypedSupabaseClient } from '#/utils/supabase/client';
import {
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  insertQuestion,
  updateQuestion,
} from '@/queries/questionqueries';
import { useSupabase } from './useSupabase';

export const getQuestionQueryKey = (questionId: string) => [
  'question',
  questionId,
];

export const getQuestionQueryOptions = (
  supabase: TypedSupabaseClient,
  questionId: string,
) =>
  queryOptions({
    queryKey: getQuestionQueryKey(questionId),
    queryFn: async () => (await getQuestion(supabase, questionId)).data ?? null,
  });

export const useGetQuestion = (questionId: string) => {
  const supabase = useSupabase();
  return useSuspenseQuery(getQuestionQueryOptions(supabase, questionId));
};

export const getAllQuestionsQueryKey = () => ['questions'];

export const getAllQuestionsQueryOptions = (supabase: TypedSupabaseClient) =>
  queryOptions({
    queryKey: getAllQuestionsQueryKey(),
    queryFn: async () => (await getAllQuestions(supabase)).data ?? null,
  });

export function useGetAllQuestions() {
  const supabase = useSupabase();
  return useSuspenseQuery(getAllQuestionsQueryOptions(supabase));
}

export function useInsertQuestion() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ question }: { question: string }) =>
      (await insertQuestion(supabase, question)).data ?? null,
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await client.invalidateQueries({ queryKey: getAllQuestionsQueryKey() });
    },
  });
}

export function useUpdateQuestion() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({
      questionId,
      question,
    }: {
      questionId: string;
      question: string;
    }) => {
      return (
        (
          await updateQuestion(supabase, {
            id: questionId,
            question,
          })
        ).data ?? null
      );
    },
    onSettled: async (_data, _error, { questionId }, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getQuestionQueryKey(questionId) }),
        client.invalidateQueries({ queryKey: getAllQuestionsQueryKey() }),
      ]);
    },
  });
}

export function useDeleteQuestion() {
  const supabase = useSupabase();
  return useMutation({
    mutationFn: async ({ questionId }: { questionId: string }) =>
      (await deleteQuestion(supabase, questionId)).data ?? null,
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await client.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
