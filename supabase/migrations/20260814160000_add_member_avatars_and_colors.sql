-- Private member avatars and a fixed, accessible identity-colour palette.

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

alter table public.couple_members
  add column if not exists avatar_path text;

alter table public.couple_members
  add column if not exists profile_color text not null default 'coral' check (
    profile_color in ('coral', 'sage', 'blue', 'plum', 'amber', 'rose')
  );

update public.couple_members as member
set profile_color = 'sage'
where member.role = 'member'
  and member.profile_color = 'coral'
  and exists (
    select 1
    from public.couple_members as owner
    where owner.couple_id = member.couple_id
      and owner.role = 'owner'
      and owner.profile_color = 'coral'
  );

create unique index if not exists couple_members_couple_profile_color_idx
  on public.couple_members (couple_id, profile_color);

grant update (display_name, avatar_path, profile_color)
  on public.couple_members to authenticated;

drop policy if exists "Members can update their own profile"
  on public.couple_members;

create policy "Members can update their own profile"
on public.couple_members for update
to authenticated
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

create or replace function public.shares_couple_with(target_user_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1
    from public.couple_members as viewer
    join public.couple_members as target
      on target.couple_id = viewer.couple_id
    where viewer.user_id = auth.uid()
      and target.user_id::text = target_user_id
  );
$$;

revoke all on function public.shares_couple_with(text) from public, anon;
grant execute on function public.shares_couple_with(text) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'couple_members'
  ) then
    alter publication supabase_realtime add table public.couple_members;
  end if;
end $$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Couple members can view avatars" on storage.objects;
create policy "Couple members can view avatars"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and public.shares_couple_with((storage.foldername(name))[1])
);

drop policy if exists "Members can upload their avatar" on storage.objects;
create policy "Members can upload their avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Members can replace their avatar" on storage.objects;
create policy "Members can replace their avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Members can delete their avatar" on storage.objects;
create policy "Members can delete their avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
