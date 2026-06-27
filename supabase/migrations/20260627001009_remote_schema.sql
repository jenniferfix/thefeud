drop policy "everyone can see answers" on "public"."answers";

drop policy "public can see events" on "public"."game_events";

drop policy "Update own instances" on "public"."game_instance";

drop policy "allow everyone to read" on "public"."game_instance";

drop policy "allow everyone to read questions" on "public"."game_questions";

drop policy "allow everyone to read games" on "public"."games";

drop view if exists "public"."active_games";

alter table "public"."game_instance" add column "answers" json not null default '{}'::json;

alter table "public"."game_instance" add column "completed_question_ids" uuid[] not null default '{}'::uuid[];

alter table "public"."game_instance" add column "confetti_mode" text not null default 'disabled'::text;

alter table "public"."game_instance" add column "current_question_id" text;

alter table "public"."game_instance" add column "left_score" integer not null default 0;

alter table "public"."game_instance" add column "question_text" text not null default '""'::text;

alter table "public"."game_instance" add column "right_score" integer not null default 0;

alter table "public"."game_instance" add column "round_score" integer not null default 0;

alter table "public"."game_instance" add column "strikes" smallint not null default '0'::smallint;

create or replace view "public"."active_games" as  SELECT game_instance.id,
    game_instance.created_at,
    games.name,
    game_instance.userid
   FROM (public.game_instance
     JOIN public.games ON ((game_instance.gameid = games.id)))
  WHERE (game_instance.id IN ( SELECT DISTINCT ON (game_events.instanceid) game_events.instanceid
           FROM public.game_events));



  create policy "select own answers"
  on "public"."answers"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "select own events"
  on "public"."game_events"
  as permissive
  for select
  to authenticated
using ((userid = auth.uid()));



  create policy "select own"
  on "public"."game_instance"
  as permissive
  for select
  to authenticated
using ((userid = auth.uid()));



  create policy "update own"
  on "public"."game_instance"
  as permissive
  for update
  to authenticated
using ((userid = auth.uid()));



  create policy "select own"
  on "public"."game_questions"
  as permissive
  for select
  to authenticated
using ((userid = auth.uid()));



  create policy "select own"
  on "public"."games"
  as permissive
  for select
  to authenticated
using ((userid = auth.uid()));



