import { normalizeToArray } from '#/lib/utils';
import type { Database } from '@/types/supabase.types';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

export async function getAnswersByQuestionId(
  client: TypedSupabaseClient,
  questionid: string,
) {
  return await client
    .from('answers')
    .select('*')
    .eq('question_id', questionid)
    .throwOnError()
    .order('score', { ascending: false })
    .order('answer', { ascending: false });
}

export async function updateAnswer(
  client: TypedSupabaseClient,
  params: {
    id: string;
    data: Database['public']['Tables']['answers']['Update'];
  },
) {
  return await client
    .from('answers')
    .update({ ...params.data })
    .match({ id: params.id })
    .select()
    .throwOnError();
}

export async function deleteAnswer(client: TypedSupabaseClient, id: string) {
  return await client.from('answers').delete().eq('id', id).throwOnError();
}

export type AnswersInsert = Database['public']['Tables']['answers']['Insert'];

export async function insertAnswer(
  client: TypedSupabaseClient,
  // data: Tables<'answers'> & Required<Pick<Tables<'answers'>, 'question_id'>>,
  data: AnswersInsert[],
) {
  return await client.from('answers').insert(data).select().throwOnError();
}
