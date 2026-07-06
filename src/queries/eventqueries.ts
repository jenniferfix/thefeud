// import { QueryData } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';
import type { TypedSupabaseClient } from '@/utils/supabase/client';

export const insertEvent = async (
  client: TypedSupabaseClient,
  event: Database['public']['Tables']['game_events']['Insert'],
) => {
  return await client
    .from('game_events')
    .insert({ ...event })
    .throwOnError();
};

export const getEventsForGameInstance = async (
  client: TypedSupabaseClient,
  instanceId: string,
) => {
  return await client
    .from('game_events')
    .select('*')
    .eq('instanceid', instanceId)
    .throwOnError()
    .order('id', { ascending: true })
    .throwOnError();
};
