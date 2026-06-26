import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useSupabaseAuth } from '#/supabaseauth';
import {
  deleteQuestion,
  getQuestion,
  getUsersQuestions,
  insertQuestion,
  updateQuestion,
} from '@/queries/questionqueries';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';

const supabase = getSupabaseBrowserClient();

export const getQuestionQueryKey = (questionId: string) => [
  'question',
  questionId,
];

export const getQuestionQueryOptions = (questionId: string) =>
  queryOptions({
    queryKey: getQuestionQueryKey(questionId),
    queryFn: async () => (await getQuestion(supabase, questionId)).data ?? null,
  });

export const useGetQuestion = (questionId: string) => {
  return useSuspenseQuery(getQuestionQueryOptions(questionId));
};

export const getQuestionsQueryKey = () => ['questions'];

export const getUserQuestionsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: getQuestionsQueryKey(),
    queryFn: async () =>
      (await getUsersQuestions(supabase, userId)).data ?? null,
  });

export function useGetUsersQuestions() {
  const auth = useSupabaseAuth();
  return useSuspenseQuery(getUserQuestionsQueryOptions(auth.user!.id));
}

export function useInsertQuestion() {
  return useMutation({
    mutationFn: async ({ question }: { question: string }) =>
      (await insertQuestion(supabase, question)).data ?? null,
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await client.invalidateQueries({ queryKey: getQuestionsQueryKey() });
    },
  });
}

export function useUpdateQuestion() {
  return useMutation({
    mutationFn: async ({
      questionId,
      question,
    }: {
      questionId: string;
      question: string;
    }) => {
      return (
        (await updateQuestion(supabase, { id: questionId, question })).data ??
        null
      );
    },
    onSettled: async (_data, _error, { questionId }, _result, { client }) => {
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: getQuestionQueryKey(questionId) }),
        client.invalidateQueries({ queryKey: getQuestionsQueryKey() }),
      ]);
    },
  });
}

export function useDeleteQuestion() {
  return useMutation({
    mutationFn: async ({ questionId }: { questionId: string }) =>
      (await deleteQuestion(supabase, questionId)).data ?? null,
    onSettled: async (_data, _error, _variables, _result, { client }) => {
      await client.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
