alter table public.funko_hunts
  drop constraint if exists funko_hunts_user_id_hunt_month_key;

create index if not exists funko_hunts_user_status_created_idx
  on public.funko_hunts (user_id, status, created_at desc);

create index if not exists funko_hunts_shared_shelf_status_created_idx
  on public.funko_hunts (shared_shelf_id, status, created_at desc)
  where shared_shelf_id is not null;
