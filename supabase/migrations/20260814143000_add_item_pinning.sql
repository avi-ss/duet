-- Incremental migration for projects that already ran the initial Duet schema.
-- Safe to run once from the Supabase SQL Editor; existing items stay unpinned.

alter table public.items
  add column if not exists is_pinned boolean not null default false;

grant update (is_pinned) on public.items to authenticated;

create index if not exists items_couple_pinned_idx
  on public.items (couple_id, is_pinned, created_at desc);
