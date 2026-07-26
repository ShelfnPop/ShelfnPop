alter table public.funko_hunt_finds
  add column if not exists is_best_find boolean not null default false;

create index if not exists funko_hunt_finds_best_idx
  on public.funko_hunt_finds (hunt_id, is_best_find, created_at desc);
