create table if not exists public.funko_hunts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shared_shelf_id uuid references public.shared_shelves(id) on delete set null,
  title text not null,
  hunt_month date not null,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  theme text,
  set_goal text,
  goals text[] not null default '{}',
  recap text,
  favorite_memory text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, hunt_month)
);

create table if not exists public.funko_hunt_stops (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.funko_hunts(id) on delete cascade,
  stop_order integer not null default 0,
  name text not null,
  detail text,
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funko_hunt_memories (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.funko_hunts(id) on delete cascade,
  author_user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  memory_type text not null default 'note' check (memory_type in ('note', 'best_find', 'funny_moment', 'still_hunting')),
  body text not null,
  mood text,
  created_at timestamptz not null default now()
);

create table if not exists public.funko_hunt_finds (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.funko_hunts(id) on delete cascade,
  found_by_user_id uuid default auth.uid() references public.profiles(id) on delete set null,
  pop_catalog_id uuid references public.pop_catalog(id) on delete set null,
  collection_item_id uuid references public.user_collection_items(id) on delete set null,
  pop_name text,
  outcome text not null default 'spotted' check (outcome in ('spotted', 'bought', 'passed', 'wishlist')),
  note text,
  created_at timestamptz not null default now()
);

alter table public.funko_hunts enable row level security;
alter table public.funko_hunt_stops enable row level security;
alter table public.funko_hunt_memories enable row level security;
alter table public.funko_hunt_finds enable row level security;

grant select, insert, update, delete on public.funko_hunts to authenticated;
grant select, insert, update, delete on public.funko_hunt_stops to authenticated;
grant select, insert, update, delete on public.funko_hunt_memories to authenticated;
grant select, insert, update, delete on public.funko_hunt_finds to authenticated;

create index if not exists funko_hunts_user_month_idx on public.funko_hunts (user_id, hunt_month desc);
create index if not exists funko_hunts_shared_shelf_idx on public.funko_hunts (shared_shelf_id);
create index if not exists funko_hunt_stops_hunt_order_idx on public.funko_hunt_stops (hunt_id, stop_order);
create index if not exists funko_hunt_memories_hunt_created_idx on public.funko_hunt_memories (hunt_id, created_at desc);
create index if not exists funko_hunt_finds_hunt_created_idx on public.funko_hunt_finds (hunt_id, created_at desc);

drop policy if exists "Users can view own or shared shelf hunts" on public.funko_hunts;
create policy "Users can view own or shared shelf hunts"
  on public.funko_hunts
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      shared_shelf_id is not null
      and private.is_shared_shelf_member(shared_shelf_id, (select auth.uid()))
    )
  );

drop policy if exists "Users can create their own hunts" on public.funko_hunts;
create policy "Users can create their own hunts"
  on public.funko_hunts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own hunts" on public.funko_hunts;
create policy "Users can update their own hunts"
  on public.funko_hunts
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own hunts" on public.funko_hunts;
create policy "Users can delete their own hunts"
  on public.funko_hunts
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Members can view hunt stops" on public.funko_hunt_stops;
create policy "Members can view hunt stops"
  on public.funko_hunt_stops
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_stops.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Owners can manage hunt stops" on public.funko_hunt_stops;
create policy "Owners can manage hunt stops"
  on public.funko_hunt_stops
  for all
  to authenticated
  using (
    exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_stops.hunt_id
        and h.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_stops.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can view hunt memories" on public.funko_hunt_memories;
create policy "Members can view hunt memories"
  on public.funko_hunt_memories
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_memories.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Members can add hunt memories" on public.funko_hunt_memories;
create policy "Members can add hunt memories"
  on public.funko_hunt_memories
  for insert
  to authenticated
  with check (
    author_user_id = (select auth.uid())
    and exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_memories.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Authors or owners can update hunt memories" on public.funko_hunt_memories;
create policy "Authors or owners can update hunt memories"
  on public.funko_hunt_memories
  for update
  to authenticated
  using (
    author_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_memories.hunt_id
        and h.user_id = (select auth.uid())
    )
  )
  with check (
    author_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_memories.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Authors or owners can delete hunt memories" on public.funko_hunt_memories;
create policy "Authors or owners can delete hunt memories"
  on public.funko_hunt_memories
  for delete
  to authenticated
  using (
    author_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_memories.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members can view hunt finds" on public.funko_hunt_finds;
create policy "Members can view hunt finds"
  on public.funko_hunt_finds
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_finds.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Members can add hunt finds" on public.funko_hunt_finds;
create policy "Members can add hunt finds"
  on public.funko_hunt_finds
  for insert
  to authenticated
  with check (
    coalesce(found_by_user_id, (select auth.uid())) = (select auth.uid())
    and exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_finds.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Find authors or owners can update hunt finds" on public.funko_hunt_finds;
create policy "Find authors or owners can update hunt finds"
  on public.funko_hunt_finds
  for update
  to authenticated
  using (
    found_by_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_finds.hunt_id
        and h.user_id = (select auth.uid())
    )
  )
  with check (
    found_by_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_finds.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Find authors or owners can delete hunt finds" on public.funko_hunt_finds;
create policy "Find authors or owners can delete hunt finds"
  on public.funko_hunt_finds
  for delete
  to authenticated
  using (
    found_by_user_id = (select auth.uid())
    or exists (
      select 1 from public.funko_hunts h
      where h.id = funko_hunt_finds.hunt_id
        and h.user_id = (select auth.uid())
    )
  );
