alter table public.funko_hunt_stops
  add column if not exists visit_status text not null default 'planned',
  add column if not exists visit_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'funko_hunt_stops_visit_status_check'
      and conrelid = 'public.funko_hunt_stops'::regclass
  ) then
    alter table public.funko_hunt_stops
      add constraint funko_hunt_stops_visit_status_check
      check (visit_status in ('planned', 'visited', 'found', 'no_luck'));
  end if;
end $$;

create index if not exists funko_hunt_stops_hunt_status_idx
  on public.funko_hunt_stops (hunt_id, visit_status, stop_order);
