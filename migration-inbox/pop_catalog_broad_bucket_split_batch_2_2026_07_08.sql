-- Audit note: broad bucket cleanup batch 2 staged/applied 2026-07-08.
-- Scope: targeted rows in DC Super Heroes, Marvel Universe, Marvel Comics, and Pokemon.
-- Sources:
--   Black Adam existing reviewed in-app set.
--   Fantastic Four existing reviewed in-app set.
--   Moon Knight comic-line cross-checks:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3263&ns=200&series=marvelfunko&ssid=27
--     https://www.moonknightfan.com/funkos.html
--   Pokemon Pop! Sets FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4080&mode=3&series=pokemonfunko&ssid=3
--
-- Live changes made:
--   * Moved Black Adam #348 from DC Super Heroes to Black Adam and applied the reviewed 13-piece set total.
--   * Moved Annihilus #917 from Marvel Universe to Fantastic Four and applied the reviewed 22-piece set total.
--   * Moved Moon Knight #8 and Moon Knight #272 Walgreens into Moon Knight (Comics), alongside existing comic-line rows.
--     No completion total is assigned yet because the full comic-line denominator still needs a dedicated source pass.
--   * Moved the Eevee/Vaporeon/Jolteon/Flareon 4-Pack from Pokemon to Pokemon Pop! Sets and seeded the 2-piece Pop! Sets checklist.
--   * Added matching UPC overrides to lookup_pop so future scans preserve these identity corrections.

update public.pop_catalog
set
  set_name = case upc
    when '889698465472' then 'Black Adam'
    when '889698581561' then 'Fantastic Four'
    when '889698615006' then 'Moon Knight (Comics)'
    when '889698211116' then 'Moon Knight (Comics)'
    when '889698673105' then 'Pokemon Pop! Sets'
    else set_name
  end,
  set_total = case upc
    when '889698465472' then 13
    when '889698581561' then 22
    when '889698673105' then 2
    else set_total
  end,
  pop_style = case upc
    when '889698673105' then '4-Pack'
    else pop_style
  end
where upc in (
  '889698465472',
  '889698581561',
  '889698615006',
  '889698211116',
  '889698673105'
);

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    (
      'Moon Knight (Comics)',
      'Marvel',
      'draft',
      'FigureRealm Marvel Universe and MoonKnightFan comic-line checks',
      'https://www.moonknightfan.com/funkos.html',
      0.78,
      now(),
      'Comic-line rows are split from Moon Knight TV. Completion total is intentionally unset until a complete comic-line checklist source is confirmed.'
    ),
    (
      'Pokemon Pop! Sets',
      U&'Pok\00E9mon',
      'reviewed',
      'FigureRealm Pokemon Pop! Sets checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4080&mode=3&series=pokemonfunko&ssid=3',
      0.88,
      now(),
      'FigureRealm Pop! Sets subpage lists two Pokemon multi-pack sets.'
    )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name
), checklist(set_name, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Pokemon Pop! Sets', '889698673105', 'Eevee, Vaporeon, Jolteon, Flareon', 'Eevee, Vaporeon, Jolteon, Flareon', null, 'Common', null, 'Pop! Games', '4-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4080&mode=3&series=pokemonfunko&ssid=3', 0.88::numeric, 'Pokemon Pop! Sets checklist item.'),
    ('Pokemon Pop! Sets', null, 'Pikachu, Bulbasaur, Charmander, Squirtle', 'Pikachu, Bulbasaur, Charmander, Squirtle', null, 'Common', null, 'Pop! Games', '4-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4080&mode=3&series=pokemonfunko&ssid=3', 0.88::numeric, 'Pokemon Pop! Sets checklist item.')
), matched as (
  select
    upsert_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join upsert_sets on upsert_sets.canonical_name = checklist.set_name
  left join lateral (
    select pc.id
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(checklist.set_name)
      and (
        (checklist.upc_value is not null and pc.upc = checklist.upc_value)
        or lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
      )
    order by pc.created_at desc nulls last
    limit 1
  ) pc on true
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
  set_id,
  pop_catalog_id,
  upc_value,
  pop_name,
  character_name,
  number_value,
  variant_value,
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  source_url,
  confidence_value,
  notes_value
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  upc = coalesce(excluded.upc, public.pop_set_checklist_items.upc),
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
