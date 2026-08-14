-- Duet: private shared spaces, memberships and polymorphic saved items.
-- Run this migration from the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto with schema extensions;

create type public.member_role as enum ('owner', 'member');
create type public.item_type as enum ('wishlist', 'note', 'link');

create or replace function public.generate_invite_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select pg_catalog.upper(
    pg_catalog.substr(
      pg_catalog.encode(extensions.gen_random_bytes(6), 'hex'),
      1,
      8
    )
  );
$$;

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  invite_code text not null unique default public.generate_invite_code(),
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  display_name text check (
    display_name is null or char_length(trim(display_name)) between 1 and 50
  ),
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  type public.item_type not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  url text check (url is null or char_length(url) <= 2048),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  is_pinned boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_couple_id_created_at_idx
  on public.items (couple_id, created_at desc);
create index items_couple_id_type_idx
  on public.items (couple_id, type);
create index couple_members_user_id_idx
  on public.couple_members (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

-- SECURITY DEFINER helpers prevent recursive membership-policy lookups.
create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = target_couple_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_couple_owner(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = target_couple_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.create_couple(couple_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  new_couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501';
  end if;

  if length(trim(couple_name)) not between 1 and 60 then
    raise exception 'El nombre debe tener entre 1 y 60 caracteres.';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'Ya perteneces a un espacio.';
  end if;

  insert into public.couples (name)
  values (trim(couple_name))
  returning id into new_couple_id;

  insert into public.couple_members (couple_id, user_id, role)
  values (new_couple_id, auth.uid(), 'owner');

  return new_couple_id;
end;
$$;

create or replace function public.join_couple(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  target_couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'Ya perteneces a un espacio.';
  end if;

  select id into target_couple_id
  from public.couples
  where invite_code = upper(trim(code));

  if target_couple_id is null then
    raise exception 'El código de invitación no es válido.';
  end if;

  -- Serialise joins so two simultaneous requests cannot exceed the limit.
  perform 1 from public.couples where id = target_couple_id for update;

  if (select count(*) from public.couple_members where couple_id = target_couple_id) >= 2 then
    raise exception 'Este espacio ya tiene dos miembros.';
  end if;

  insert into public.couple_members (couple_id, user_id, role)
  values (target_couple_id, auth.uid(), 'member');

  return target_couple_id;
end;
$$;

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.items enable row level security;

create policy "Members can read their couple"
on public.couples for select
to authenticated
using (public.is_couple_member(id));

create policy "Owners can update their couple"
on public.couples for update
to authenticated
using (public.is_couple_owner(id))
with check (public.is_couple_owner(id));

create policy "Members can read fellow members"
on public.couple_members for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can update their own profile"
on public.couple_members for update
to authenticated
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

create policy "Members can read items"
on public.items for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can create items"
on public.items for insert
to authenticated
with check (
  public.is_couple_member(couple_id)
  and created_by = auth.uid()
);

create policy "Members can update items"
on public.items for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

create policy "Members can delete items"
on public.items for delete
to authenticated
using (public.is_couple_member(couple_id));

-- Only expose the exact operations used by the browser client.
revoke all on public.couples, public.couple_members, public.items from anon, authenticated;
grant select on public.couples, public.couple_members, public.items to authenticated;
grant update (name) on public.couples to authenticated;
grant update (display_name) on public.couple_members to authenticated;
grant insert (couple_id, type, title, description, url, image_url, metadata)
  on public.items to authenticated;
grant update (type, title, description, url, image_url, is_pinned, metadata)
  on public.items to authenticated;
grant delete on public.items to authenticated;

revoke all on function public.generate_invite_code() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.is_couple_member(uuid) from public, anon;
revoke all on function public.is_couple_owner(uuid) from public, anon;
revoke all on function public.create_couple(text) from public, anon;
revoke all on function public.join_couple(text) from public, anon;

grant execute on function public.is_couple_member(uuid) to authenticated;
grant execute on function public.is_couple_owner(uuid) to authenticated;
grant execute on function public.create_couple(text) to authenticated;
grant execute on function public.join_couple(text) to authenticated;

-- Realtime is optional for the UI, but lets both clients refresh immediately.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'items'
  ) then
    alter publication supabase_realtime add table public.items;
  end if;
end;
$$;
