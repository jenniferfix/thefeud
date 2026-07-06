alter table "public"."game_instance" add column "finished" timestamp without time zone;
CREATE INDEX answers_question_id_idx ON public.answers USING btree (question_id);
CREATE INDEX answers_user_id_idx ON public.answers USING btree (user_id);
CREATE INDEX game_events_instanceid_idx ON public.game_events USING btree (instanceid);
CREATE INDEX game_instance_finished_idx ON public.game_instance USING btree (finished);
CREATE INDEX game_instance_game_idx ON public.game_instance USING btree (game);
CREATE INDEX game_instance_userid_idx ON public.game_instance USING btree (userid);
