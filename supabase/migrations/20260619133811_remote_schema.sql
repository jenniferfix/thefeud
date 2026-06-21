drop view if exists "public"."active_games";

alter table "public"."game_questions" alter column "position" set not null;

create or replace view "public"."active_games" as  SELECT game_instance.id,
    game_instance.created_at,
    games.name,
    game_instance.userid
   FROM (public.game_instance
     JOIN public.games ON ((game_instance.gameid = games.id)))
  WHERE (game_instance.id IN ( SELECT DISTINCT ON (game_events.instanceid) game_events.instanceid
           FROM public.game_events));



