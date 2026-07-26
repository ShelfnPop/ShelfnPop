alter table public.pop_sets
  add column if not exists set_classification text not null default 'checklist',
  add column if not exists completion_eligible boolean not null default true,
  add column if not exists completion_review_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pop_sets_set_classification_check'
      and conrelid = 'public.pop_sets'::regclass
  ) then
    alter table public.pop_sets
      add constraint pop_sets_set_classification_check
      check (set_classification in ('checklist', 'mini_set', 'single_release', 'unreviewed'));
  end if;
end $$;

update public.pop_sets
set
  set_classification = 'single_release',
  completion_eligible = false,
  completion_review_note = 'Single comic cover or one-off release; do not count as a completed set.'
where
  coalesce(source_label, '') ilike '%comic cover%'
  or coalesce(notes, '') ilike '%single comic cover%';

update public.pop_sets
set
  set_classification = 'unreviewed',
  completion_eligible = false,
  completion_review_note = 'Catalog-scoped or partial checklist; needs a full denominator review before completion can be reported.'
where
  set_classification <> 'single_release'
  and (
    coalesce(source_label, '') ilike '%scoped live catalog%'
    or coalesce(source_label, '') = 'catalog reviewed rows'
    or coalesce(notes, '') ilike '%currently represented%'
    or coalesce(notes, '') ilike '%full%checklist%larger%'
    or coalesce(notes, '') ilike '%pending later%'
    or coalesce(notes, '') ilike '%owned rows%'
  );

update public.pop_sets
set
  set_classification = 'unreviewed',
  completion_eligible = false,
  completion_review_note = 'Known partial checklist; needs full review before completion can be reported.'
where canonical_name in ('House of the Dragon', 'Shaun Of The Dead');

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
  count(i.id)::integer as checklist_count,
  s.set_classification,
  s.completion_eligible,
  s.completion_review_note
from public.pop_sets s
left join public.pop_set_checklist_items i on i.set_id = s.id
group by
  s.id,
  s.canonical_name,
  s.franchise,
  s.status,
  s.source_label,
  s.source_url,
  s.confidence,
  s.reviewed_at,
  s.set_classification,
  s.completion_eligible,
  s.completion_review_note;

grant select on public.pop_set_completion_catalog_summary to authenticated;
