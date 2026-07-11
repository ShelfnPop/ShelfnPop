create table if not exists public.pop_sets (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  franchise text,
  status text not null default 'draft' check (status in ('draft', 'reviewed')),
  source_label text,
  source_url text,
  confidence numeric(3,2) default 0.80 check (confidence is null or (confidence >= 0 and confidence <= 1)),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_name, franchise)
);

create table if not exists public.pop_set_checklist_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.pop_sets(id) on delete cascade,
  pop_catalog_id uuid references public.pop_catalog(id) on delete set null,
  upc text,
  pop_name text not null,
  character text,
  number text,
  variant text,
  exclusivity text,
  pop_type text,
  pop_style text,
  is_required_for_completion boolean not null default true,
  source_url text,
  confidence numeric(3,2) default 0.80 check (confidence is null or (confidence >= 0 and confidence <= 1)),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pop_set_checklist_items_identity_idx
  on public.pop_set_checklist_items (
    set_id,
    coalesce(number, ''),
    lower(coalesce(pop_name, '')),
    lower(coalesce(variant, '')),
    lower(coalesce(exclusivity, ''))
  );

create index if not exists pop_set_checklist_items_set_required_idx
  on public.pop_set_checklist_items (set_id, is_required_for_completion);

alter table public.pop_sets enable row level security;
alter table public.pop_set_checklist_items enable row level security;

drop policy if exists "Authenticated users can read pop sets" on public.pop_sets;
create policy "Authenticated users can read pop sets"
  on public.pop_sets
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read pop set checklist items" on public.pop_set_checklist_items;
create policy "Authenticated users can read pop set checklist items"
  on public.pop_set_checklist_items
  for select
  to authenticated
  using (true);

grant select on public.pop_sets to authenticated;
grant select on public.pop_set_checklist_items to authenticated;

create or replace view public.pop_set_completion_catalog_summary
with (security_invoker = true) as
select
  s.id as set_id,
  s.canonical_name as set_name,
  s.franchise,
  s.status,
  s.source_label,
  s.source_url,
  s.confidence,
  s.reviewed_at,
  count(i.id) filter (where i.is_required_for_completion)::integer as required_count,
  count(i.id)::integer as checklist_count
from public.pop_sets s
left join public.pop_set_checklist_items i on i.set_id = s.id
group by s.id, s.canonical_name, s.franchise, s.status, s.source_label, s.source_url, s.confidence, s.reviewed_at;

grant select on public.pop_set_completion_catalog_summary to authenticated;

insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
values (
  'Scrubs',
  'Scrubs',
  'reviewed',
  'Funko Scrubs announcement and catalog cross-check',
  'https://funko.com/blogs/news/coming-soon-scrubs-pop',
  0.95,
  now(),
  'Seed checklist for first set-completion proof of concept.'
)
on conflict (canonical_name, franchise) do update set
  status = excluded.status,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  reviewed_at = excluded.reviewed_at,
  notes = excluded.notes,
  updated_at = now();

with scrubs_set as (
  select id from public.pop_sets where canonical_name = 'Scrubs' and franchise = 'Scrubs'
), scrubs_items(upc, pop_name, character_name, number_value) as (
  values
    ('889698355988', 'J.D.', 'J.D.', '737'),
    ('889698355995', 'Turk', 'Turk', '738'),
    ('889698356008', 'Dr. Cox', 'Dr. Cox', '739'),
    ('889698363433', 'Elliot', 'Elliot', '740')
)
insert into public.pop_set_checklist_items (
  set_id,
  pop_catalog_id,
  upc,
  pop_name,
  character,
  number,
  variant,
  exclusivity,
  pop_type,
  pop_style,
  is_required_for_completion,
  source_url,
  confidence,
  notes
)
select
  scrubs_set.id,
  pc.id,
  scrubs_items.upc,
  scrubs_items.pop_name,
  scrubs_items.character_name,
  scrubs_items.number_value,
  'Common',
  null,
  'Pop! Television',
  'Standard',
  true,
  'https://funko.com/blogs/news/coming-soon-scrubs-pop',
  0.95,
  'Seed checklist row for Scrubs set completion.'
from scrubs_set
cross join scrubs_items
left join public.pop_catalog pc on pc.upc = scrubs_items.upc
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = excluded.pop_catalog_id,
  upc = excluded.upc,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
