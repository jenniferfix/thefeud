drop policy "allow everyone tor ead questions" on "public"."questions";
drop view if exists "public"."active_games";
create or replace view "public"."active_games" as  SELECT game_instance.id,
    game_instance.created_at,
    games.name,
    game_instance.userid
   FROM (public.game_instance
     JOIN public.games ON ((game_instance.gameid = games.id)))
  WHERE (game_instance.id IN ( SELECT DISTINCT ON (game_events.instanceid) game_events.instanceid
           FROM public.game_events));
create policy "select own"
  on "public"."questions"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));
