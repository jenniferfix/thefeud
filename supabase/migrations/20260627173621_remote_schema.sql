drop policy "Enable insert for authenticated users only" on "public"."game_instance";
drop policy "delete own answers" on "public"."answers";
drop policy "select own answers" on "public"."answers";
drop policy "update own answers" on "public"."answers";
drop policy "authenticated can insert" on "public"."game_events";
drop policy "delete own events" on "public"."game_events";
drop policy "select own events" on "public"."game_events";
drop policy "delete own game instances" on "public"."game_instance";
drop policy "select own" on "public"."game_instance";
drop policy "update own" on "public"."game_instance";
drop policy "authenticated users can insert" on "public"."game_questions";
drop policy "delete policy" on "public"."game_questions";
drop policy "select own" on "public"."game_questions";
drop policy "update policy" on "public"."game_questions";
drop policy "delete own games" on "public"."games";
drop policy "select own" on "public"."games";
drop policy "update own games" on "public"."games";
drop policy "authenticated users insert" on "public"."questions";
drop policy "delete own questions" on "public"."questions";
drop policy "select own" on "public"."questions";
drop policy "update own questions" on "public"."questions";
drop view if exists "public"."active_games";
create or replace view "public"."active_games" as  SELECT game_instance.id,
    game_instance.created_at,
    games.name,
    game_instance.userid
   FROM (public.game_instance
     JOIN public.games ON ((game_instance.gameid = games.id)))
  WHERE (game_instance.id IN ( SELECT DISTINCT ON (game_events.instanceid) game_events.instanceid
           FROM public.game_events));
create policy "insert own"
  on "public"."game_instance"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "delete own answers"
  on "public"."answers"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
create policy "select own answers"
  on "public"."answers"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
create policy "update own answers"
  on "public"."answers"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "authenticated can insert"
  on "public"."game_events"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "delete own events"
  on "public"."game_events"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "select own events"
  on "public"."game_events"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "delete own game instances"
  on "public"."game_instance"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "select own"
  on "public"."game_instance"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "update own"
  on "public"."game_instance"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid))
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "authenticated users can insert"
  on "public"."game_questions"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "delete policy"
  on "public"."game_questions"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "select own"
  on "public"."game_questions"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "update policy"
  on "public"."game_questions"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid))
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "delete own games"
  on "public"."games"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "select own"
  on "public"."games"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));
create policy "update own games"
  on "public"."games"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid))
with check ((( SELECT auth.uid() AS uid) = userid));
create policy "authenticated users insert"
  on "public"."questions"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "delete own questions"
  on "public"."questions"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
create policy "select own"
  on "public"."questions"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
create policy "update own questions"
  on "public"."questions"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));
