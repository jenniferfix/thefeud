drop policy "check uid is their own and user is authenticated" on "public"."answers";


  create policy "check uid is their own and user is authenticated"
  on "public"."answers"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM public.questions q
  WHERE ((q.id = answers.question_id) AND (q.user_id = ( SELECT auth.uid() AS uid)))))));



