update public.pop_sets
set
  set_classification = 'single_release',
  completion_eligible = false,
  completion_review_note = 'Single one-off catalog release; visible in shelf breakdown but not counted as a completed set.'
where canonical_name in (
  'Superman: Ghosts of Krypton',
  'Superman/Batman'
);

update public.pop_sets
set
  set_classification = 'checklist',
  completion_eligible = true,
  completion_review_note = 'Reviewed Clone Wars checklist restored after audit; denominator is not based only on owned shelf rows.'
where canonical_name = 'Star Wars: The Clone Wars';

update public.pop_sets
set
  set_classification = 'mini_set',
  completion_eligible = true,
  completion_review_note = 'Reviewed five-item Shield Through the Ages line; eligible as a small focused set.'
where canonical_name = 'Superman: Shield Through the Ages';
