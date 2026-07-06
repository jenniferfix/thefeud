create table "public"."game_realtime_viewers" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "game_instance_id" uuid not null,
    "expires_at" timestamp with time zone not null
      );
alter table "public"."game_realtime_viewers" enable row level security;
alter table "public"."game_instance" alter column "join_code_expires" set data type timestamp with time zone using "join_code_expires"::timestamp with time zone;
CREATE UNIQUE INDEX game_realtime_viewers_pkey ON public.game_realtime_viewers USING btree (user_id, game_instance_id);
alter table "public"."game_realtime_viewers" add constraint "game_realtime_viewers_pkey" PRIMARY KEY using index "game_realtime_viewers_pkey";
alter table "public"."game_realtime_viewers" add constraint "game_realtime_viewers_game_instance_id_fkey" FOREIGN KEY (game_instance_id) REFERENCES public.game_instance(id) ON DELETE CASCADE not valid;
alter table "public"."game_realtime_viewers" validate constraint "game_realtime_viewers_game_instance_id_fkey";
alter table "public"."game_realtime_viewers" add constraint "game_realtime_viewers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."game_realtime_viewers" validate constraint "game_realtime_viewers_user_id_fkey";
grant select on table "public"."game_realtime_viewers" to "authenticated";
grant delete on table "public"."game_realtime_viewers" to "service_role";
grant insert on table "public"."game_realtime_viewers" to "service_role";
grant references on table "public"."game_realtime_viewers" to "service_role";
grant select on table "public"."game_realtime_viewers" to "service_role";
grant trigger on table "public"."game_realtime_viewers" to "service_role";
grant truncate on table "public"."game_realtime_viewers" to "service_role";
grant update on table "public"."game_realtime_viewers" to "service_role";
create policy "permanent users only"
  on "public"."answers"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "permanent users only"
  on "public"."game_events"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "permanent users only"
  on "public"."game_instance"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "permanent users only"
  on "public"."game_questions"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "users read their current realtime grants"
  on "public"."game_realtime_viewers"
  as permissive
  for select
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) AND (expires_at > now())));
create policy "permanent users only"
  on "public"."games"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "permanent users only"
  on "public"."questions"
  as restrictive
  for all
  to authenticated
using ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false))
with check ((COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false));
create policy "authorized viewers receive broadcasts"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using (((extension = 'broadcast'::text) AND (EXISTS ( SELECT 1
   FROM public.game_realtime_viewers viewer
  WHERE ((viewer.user_id = ( SELECT auth.uid() AS uid)) AND ((viewer.game_instance_id)::text = ( SELECT realtime.topic() AS topic)) AND (viewer.expires_at > now()))))));
create policy "game hosts receive broadcasts"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using (((extension = 'broadcast'::text) AND (COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false) AND (EXISTS ( SELECT 1
   FROM public.game_instance gi
  WHERE (((gi.id)::text = ( SELECT realtime.topic() AS topic)) AND (gi.userid = ( SELECT auth.uid() AS uid)))))));
create policy "game hosts send broadcasts"
  on "realtime"."messages"
  as permissive
  for insert
  to authenticated
with check (((extension = 'broadcast'::text) AND (COALESCE(( SELECT ((auth.jwt() ->> 'is_anonymous'::text))::boolean AS bool), false) = false) AND (EXISTS ( SELECT 1
   FROM public.game_instance gi
  WHERE (((gi.id)::text = ( SELECT realtime.topic() AS topic)) AND (gi.userid = ( SELECT auth.uid() AS uid)))))));
