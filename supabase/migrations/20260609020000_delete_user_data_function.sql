-- COPPA right to erasure: callable by the authenticated user to wipe all their data.
-- Deletes all user-owned rows across every data table, then deletes the auth account.
-- The client calls this via supabase.rpc('delete_my_account').

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Mark consent as revoked first (retained 365 days for legal record)
  update public.parental_consents
  set revoked_at = now()
  where user_id = v_user_id and revoked_at is null;

  -- Delete all activity data
  delete from public.question_score_breakdown  where user_id = v_user_id;
  delete from public.question_attempts         where user_id = v_user_id;
  delete from public.reading_progress          where user_id = v_user_id;
  delete from public.user_daily_story_session  where user_id = v_user_id;

  -- Delete the auth account — cascades to any remaining FK rows
  delete from auth.users where id = v_user_id;
end;
$$;

-- Only the owning user may call this; no service-role bypass needed
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
