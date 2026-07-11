update public.pop_set_checklist_items psci
set pop_name = 'Mugatu Holding Dog',
    character = 'Mugatu Holding Dog',
    variant = 'Common',
    pop_catalog_id = (
      select id from public.pop_catalog
      where lower(set_name) = 'zoolander'
        and number = '702'
        and lower(coalesce(pop_name, character, '')) like '%holding dog%'
      limit 1
    ),
    notes = 'Corrected from chase: collector-confirmed owned dog version is not a chase variant.',
    updated_at = now()
where psci.set_id = (select id from public.pop_sets where canonical_name = 'Zoolander' limit 1)
  and psci.number = '702'
  and psci.pop_name = 'Mugatu'
  and psci.variant = 'Common';

delete from public.pop_set_checklist_items psci
where psci.set_id = (select id from public.pop_sets where canonical_name = 'Zoolander' limit 1)
  and psci.number = '702'
  and psci.pop_name = 'Mugatu Holding Dog'
  and psci.variant = 'Chase';

update public.pop_sets
set confidence = 0.82,
    source_label = 'Figure Realm Zoolander checklist with collector correction',
    notes = 'Reviewed checklist adjusted by collector correction: dog version is not treated as chase for this set total.',
    reviewed_at = now(),
    updated_at = now()
where canonical_name = 'Zoolander';
