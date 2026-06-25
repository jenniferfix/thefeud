import type { QueryData } from '@supabase/supabase-js';
import type { CreateGameInstance } from '#/lib/schemas/gameInstance';
import { Tables, TablesInsert, TablesUpdate } from '#/types/supabase.types';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

type GameInstanceInsert = TablesInsert<'game_instance'>;
type GameInstanceUpdate = TablesUpdate<'game_instance'>;

export async function createGameInstance(
  client: TypedSupabaseClient,
  { gameId, teamLeft, teamRight }: CreateGameInstance,
) {
  return await client
    .from('game_instance')
    .insert({ gameid: gameId, team_left: teamLeft, team_right: teamRight })
    .throwOnError()
    .select('id, team_left, team_right, game:games(name)')
    .single()
    .throwOnError();
}

export async function updateGameInstance(
  client: TypedSupabaseClient,
  gameInstanceId: string,
  values: GameInstanceUpdate,
) {
  return await client
    .from('game_instance')
    .update(values)
    .eq('id', gameInstanceId)
    .throwOnError();
}

export async function markFinished(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    .update({ finished: new Date().toISOString() })
    .eq('id', instanceId)
    .throwOnError();
}

export async function deleteGameInstance(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    .delete()
    .eq('id', instanceId)
    .throwOnError();
}

export async function getGameInstanceUser(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    .select('id, userid, join_code')
    .eq('id', instanceId)
    .single()
    .throwOnError();
}

export async function getGameInstance(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    .select(
      `gameInstanceId:id, joinCode:join_code,
          leftTeam:team_left, rightTeam:team_right, 
          leftScore:left_score, rightScore:right_score, roundScore:round_score,
          strikes, answers, confettiMode:confetti_mode, finished, 
          questionText:question_text, currentQuestionId:current_question_id,
          game:games(id, name, 
            questions:game_questions(position, 
              question:questions(id, text:question, 
                answers(id, text:answer, score)
              )
            )
          )`,
    )
    .eq('id', instanceId)
    .single()
    .throwOnError();
}

export type GameInstance = Awaited<ReturnType<typeof getGameInstance>>['data'];

export type GameQuestion = GameInstance['game']['questions'][number];

export async function getActiveInstances(client: TypedSupabaseClient) {
  // Select events within last 10 min
  // get the instance id's of those
  // dedupe and get the actual instances
  const prevTime = new Date();
  prevTime.setDate(prevTime.getDate() - 2);
  return await client
    .from('game_instance')
    .select('id, created_at, userid, games(id,name)')
    .gt('created_at', prevTime.toISOString())
    .order('created_at', { ascending: false })
    .throwOnError();
}

export async function getUserInstances(
  client: TypedSupabaseClient,
  userId: string,
  finished?: boolean,
) {
  let query = client
    .from('game_instance')
    .select('id, created_at, userid, games(id,name)')
    .eq('userid', userId);

  if (finished !== undefined) {
    query = finished
      ? query.not('finished', 'eq', null)
      : query.is('finished', null);
  }

  return await query.order('created_at', { ascending: false }).throwOnError();
}

export type TInstance = QueryData<ReturnType<typeof getGameInstance>>;
