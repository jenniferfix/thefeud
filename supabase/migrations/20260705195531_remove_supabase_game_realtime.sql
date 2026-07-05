drop policy if exists "authorized viewers receive broadcasts"
  on realtime.messages;
drop policy if exists "game hosts receive broadcasts"
  on realtime.messages;
drop policy if exists "game hosts send broadcasts"
  on realtime.messages;

drop table if exists public.game_realtime_viewers;

do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_events'
  ) then
    execute 'alter publication supabase_realtime drop table public.game_events';
  end if;
end
$$;
