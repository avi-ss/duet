-- Persist each member's greeting name in PostgreSQL instead of Auth metadata.
-- Existing names are copied from Auth when available, otherwise from the email.

alter table public.couple_members
  add column if not exists display_name text check (
    display_name is null or char_length(trim(display_name)) between 1 and 50
  );

update public.couple_members as member
set display_name = coalesce(
  nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''),
  split_part(auth_user.email, '@', 1)
)
from auth.users as auth_user
where member.user_id = auth_user.id
  and member.display_name is null;

drop policy if exists "Members can update their own profile"
  on public.couple_members;

create policy "Members can update their own profile"
on public.couple_members for update
to authenticated
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

grant update (display_name) on public.couple_members to authenticated;
