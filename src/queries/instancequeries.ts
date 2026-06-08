import type { QueryData } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

export async function createGameInstance(
  client: TypedSupabaseClient,
  gameId: string,
) {
  return await client
    .from('game_instance')
    .insert({ game: gameId })
    .throwOnError()
    .select()
    .throwOnError();
}

export async function getGameInstance(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    .select('*')
    .eq('id', instanceId)
    .throwOnError()
    .single();
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

export async function getInstanceGame(
  client: TypedSupabaseClient,
  instanceId: string,
) {
  return await client
    .from('game_instance')
    // .select('*')
    .select('id, games(id, name, questions(id, question))')
    .eq('id', instanceId)
    .throwOnError()
    .single();
}

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
) {
  return await client
    .from('game_instance')
    .select('id, created_at, userid, games(id,name)')
    .eq('userid', userId)
    .order('created_at', { ascending: false })
    .throwOnError();
}

export type TInstance = QueryData<ReturnType<typeof getInstanceGame>>;
