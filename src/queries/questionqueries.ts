import type { TypedSupabaseClient } from '@/utils/supabase/client';
// import type { Database } from '@/types/supabase.types';

export function getQuestion(client: TypedSupabaseClient, questionid: string) {
  return client
    .from('questions')
    .select('*')
    .eq('id', questionid)
    .single()
    .throwOnError();
}

export function getUsersQuestions(client: TypedSupabaseClient, userid: string) {
  return client
    .from('questions')
    .select('*')
    .eq('user_id', userid)
    .throwOnError();
}

export function getQuestionFromId(
  client: TypedSupabaseClient,
  questionId: string,
) {
  return client
    .from('questions')
    .select('question')
    .eq('id', questionId)
    .throwOnError()
    .single();
}

export async function insertQuestion(
  client: TypedSupabaseClient,
  question: string,
) {
  return client.from('questions').insert({ question }).throwOnError();
}

export async function updateQuestion(
  client: TypedSupabaseClient,
  params: { id: string; question: string },
) {
  return client
    ?.from('questions')
    .update({ question: params.question })
    .match({ id: params.id })
    .throwOnError()
    .single();
}

export async function deleteQuestion(client: TypedSupabaseClient, id: string) {
  return client.from('questions').delete().eq('id', id).throwOnError();
}
