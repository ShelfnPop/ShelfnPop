alter table public.funko_hunt_finds
  add column if not exists stop_id uuid references public.funko_hunt_stops(id) on delete set null;

create index if not exists funko_hunt_finds_stop_created_idx
  on public.funko_hunt_finds (stop_id, created_at desc);
