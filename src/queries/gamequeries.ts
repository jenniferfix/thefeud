import type { QueryData } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

export function getGames(client: TypedSupabaseClient) {
  return client.from('games').select('*').throwOnError();
}

export async function getUserGames(
  client: TypedSupabaseClient,
  userId: string,
) {
  return await client
    .from('games')
    .select(`id, name, questions(id, question)`)
    .eq('userid', userId)
    .throwOnError();
}

export type GetUserGamesType = Awaited<
  ReturnType<typeof getUserGames>
>['data'][number];

export async function getGameQuestions(
  client: TypedSupabaseClient,
  gameId: string,
) {
  return await client
    .from('games')
    .select(`id, questions(id, question)`)
    .match({ id: gameId })
    .throwOnError()
    .single();
}
// export type QueryData<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type TGameQuestions = QueryData<ReturnType<typeof getGameQuestions>>;

export function getGame(client: TypedSupabaseClient, gameid: string) {
  return client
    .from('games')
    .select('*')
    .eq('id', gameid)
    .single()
    .throwOnError();
}
export function addQuestionToGame(
  client: TypedSupabaseClient,
  questionid: string,
  gameid: string,
) {
  return client
    .from('game_questions')
    .insert({ gameid, questionid })
    .throwOnError();
}

export function removeQuestionFromGame(
  client: TypedSupabaseClient,
  questionid: string,
  gameid: string,
) {
  return client
    .from('game_questions')
    .delete()
    .match({ gameid, questionid })
    .throwOnError();
}

export function insertGame(client: TypedSupabaseClient, name: string) {
  return client.from('games').insert({ name }).throwOnError();
}

export function updateGame(
  client: TypedSupabaseClient,
  gameId: string,
  gameName: string,
) {
  return client
    .from('games')
    .update({ name: gameName })
    .eq('id', gameId)
    .throwOnError();
}

export async function deleteGame(client: TypedSupabaseClient, gameId: string) {
  return await client.from('games').delete().eq('id', gameId).throwOnError();
}
