import type { TypedSupabaseClient } from '@/utils/supabase/client';
// import type { Database } from '@/types/supabase.types';

export async function getQuestion(
  client: TypedSupabaseClient,
  questionid: string,
) {
  return await client
    .from('questions')
    .select('*')
    .eq('id', questionid)
    .single()
    .throwOnError();
}

export async function getUsersQuestions(
  client: TypedSupabaseClient,
  userid: string,
) {
  return await client
    .from('questions')
    .select('id, question, answers(id, answer, score)')
    .eq('user_id', userid)
    .throwOnError();
}

export async function getQuestionFromId(
  client: TypedSupabaseClient,
  questionId: string,
) {
  return await client
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
  return await client
    .from('questions')
    .insert({ question })
    .select()
    .throwOnError();
}

export async function updateQuestion(
  client: TypedSupabaseClient,
  params: { id: string; question: string },
) {
  return await client
    .from('questions')
    .update({ question: params.question })
    .match({ id: params.id })
    .throwOnError()
    .single();
}

export async function deleteQuestion(client: TypedSupabaseClient, id: string) {
  return await client.from('questions').delete().eq('id', id).throwOnError();
}
