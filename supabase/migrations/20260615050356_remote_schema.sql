alter table "public"."game_instance" drop constraint "game_instance_game_fkey";

drop view if exists "public"."active_games";

drop index if exists "public"."game_instance_game_idx";

alter table "public"."game_instance" drop column "game";

alter table "public"."game_instance" add column "gameid" uuid not null;

CREATE INDEX game_instance_game_idx ON public.game_instance USING btree (gameid);

alter table "public"."game_instance" add constraint "game_instance_game_fkey" FOREIGN KEY (gameid) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."game_instance" validate constraint "game_instance_game_fkey";

create or replace view "public"."active_games" as  SELECT game_instance.id,
    game_instance.created_at,
    games.name,
    game_instance.userid
   FROM (public.game_instance
     JOIN public.games ON ((game_instance.gameid = games.id)))
  WHERE (game_instance.id IN ( SELECT DISTINCT ON (game_events.instanceid) game_events.instanceid
           FROM public.game_events));



