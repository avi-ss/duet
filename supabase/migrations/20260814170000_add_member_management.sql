-- Owners can remove the other person from their two-member space.
-- Rotating the invitation code prevents the removed member from reusing it.

create or replace function public.enforce_couple_member_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
begin
  -- Serialise every membership insertion, including future server-side flows.
  perform 1
  from public.couples
  where id = new.couple_id
  for update;

  if (
    select count(*)
    from public.couple_members
    where couple_id = new.couple_id
  ) >= 2 then
    raise exception 'Este espacio ya tiene dos miembros.';
  end if;

  return new;
end;
$$;

drop trigger if exists couple_members_enforce_limit on public.couple_members;
create trigger couple_members_enforce_limit
before insert on public.couple_members
for each row execute function public.enforce_couple_member_limit();

create or replace function public.remove_couple_member(target_member_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  owner_couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501';
  end if;

  select couple_id into owner_couple_id
  from public.couple_members
  where user_id = auth.uid()
    and role = 'owner';

  if owner_couple_id is null then
    raise exception 'Solo quien creó el espacio puede eliminar miembros.'
      using errcode = '42501';
  end if;

  if target_member_id = auth.uid() then
    raise exception 'No puedes eliminarte a ti mismo.';
  end if;

  -- Keep removal and invite-code rotation together and serialised with joins.
  perform 1
  from public.couples
  where id = owner_couple_id
  for update;

  delete from public.couple_members
  where couple_id = owner_couple_id
    and user_id = target_member_id
    and role = 'member';

  if not found then
    raise exception 'Ese miembro no pertenece a tu espacio.';
  end if;

  update public.couples
  set invite_code = public.generate_invite_code()
  where id = owner_couple_id;

  return target_member_id;
end;
$$;

revoke all on function public.remove_couple_member(uuid) from public, anon;
revoke all on function public.enforce_couple_member_limit() from public, anon, authenticated;
grant execute on function public.remove_couple_member(uuid) to authenticated;
