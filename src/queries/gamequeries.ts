import type { QueryData } from '@supabase/supabase-js';
import type { TablesUpdate } from '#/types/supabase.types';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

type GameQuestionUpdate = TablesUpdate<'game_questions'>;

export async function getUserGames(client: TypedSupabaseClient) {
  return await client
    .from('games')
    .select(
      `id, name, game_questions(position, question:questions(id, question, answers(id, answer, score)))`,
    )
    .throwOnError();
}

export async function getGameQuestions(
  client: TypedSupabaseClient,
  gameId: string,
) {
  return await client
    .from('games')
    .select(`id, game_questions(position, questions(id, question))`)
    .match({ id: gameId })
    .single()
    .throwOnError();
}

export type TGameQuestions = QueryData<ReturnType<typeof getGameQuestions>>;

export async function getGame(client: TypedSupabaseClient, gameid: string) {
  return await client
    .from('games')
    .select(
      `id, name, created_at, game_questions(position, questions(id, question, created_at, answers(id, answer, score)))`,
    )
    .eq('id', gameid)
    .single()
    .throwOnError();
}

export async function addQuestionToGame(
  client: TypedSupabaseClient,
  questionid: string,
  gameid: string,
  position: string,
) {
  return await client
    .from('game_questions')
    .insert({ gameid, questionid, position })
    .select('gameId:gameid, questionId:questionid, userId:userid')
    .single()
    .throwOnError();
}

export async function removeQuestionFromGame(
  client: TypedSupabaseClient,
  questionid: string,
  gameid: string,
) {
  return await client
    .from('game_questions')
    .delete()
    .match({ gameid, questionid })
    .select('gameId:gameid, questionId:questionid, userId:userid')
    .single()
    .throwOnError();
}

export async function updateQuestionForGame(
  client: TypedSupabaseClient,
  questionid: string,
  gameid: string,
  values: GameQuestionUpdate,
) {
  return await client
    .from('game_questions')
    .update(values)
    .match({ gameid, questionid })
    .select('gameId:gameid, questionId:questionid, userId:userid, position')
    .single()
    .throwOnError();
}

export async function insertGame(client: TypedSupabaseClient, name: string) {
  return await client
    .from('games')
    .insert({ name })
    .select('id, name')
    .single()
    .throwOnError();
}

export async function updateGame(
  client: TypedSupabaseClient,
  gameId: string,
  gameName: string,
) {
  return await client
    .from('games')
    .update({ name: gameName })
    .eq('id', gameId)
    .select('id, userId:userid, name')
    .single()
    .throwOnError();
}

export async function deleteGame(client: TypedSupabaseClient, gameId: string) {
  return await client
    .from('games')
    .delete()
    .eq('id', gameId)
    .select('id, userId:userid')
    .single()
    .throwOnError();
}
