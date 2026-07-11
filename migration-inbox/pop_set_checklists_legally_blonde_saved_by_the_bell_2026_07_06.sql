with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    (
      'Legally Blonde',
      'Legally Blonde',
      'reviewed',
      'Cardboard Connection Legally Blonde checklist',
      'https://www.cardboardconnection.com/funko-pop-legally-blonde-figures',
      0.92,
      now(),
      'Reviewed checklist includes Elle with Bruiser #1224, Elle Bunny Suit #1225, Elle Bunny Suit Diamond #1225, and Elle Sun #1226.'
    ),
    (
      'Saved By The Bell',
      'Saved by the Bell',
      'reviewed',
      'Cardboard Connection and Pop Shop Guide Saved by the Bell checklists',
      'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures',
      0.90,
      now(),
      'Reviewed checklist includes original #313-318 wave and newer #1574-1576 wave.'
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
), target_sets as (
  select id, canonical_name from upsert_sets
  union
  select id, canonical_name from public.pop_sets where canonical_name in ('Legally Blonde', 'Saved By The Bell')
), checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Legally Blonde', 'Elle With Bruiser', 'Elle With Bruiser', '1224', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-legally-blonde-figures', 0.92::numeric, 'Legally Blonde checklist item.'),
    ('Legally Blonde', 'Elle Bunny Suit', 'Elle Bunny Suit', '1225', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-legally-blonde-figures', 0.92::numeric, 'Legally Blonde checklist item.'),
    ('Legally Blonde', 'Elle Bunny Suit', 'Elle Bunny Suit', '1225', 'Diamond Collection', 'Entertainment Earth', 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-legally-blonde-figures', 0.92::numeric, 'Legally Blonde Diamond Collection checklist item.'),
    ('Legally Blonde', 'Elle Sun', 'Elle Sun', '1226', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-legally-blonde-figures', 0.92::numeric, 'Legally Blonde checklist item.'),
    ('Saved By The Bell', 'Zack Morris', 'Zack Morris', '313', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'Kelly Kapowski', 'Kelly Kapowski', '314', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'A.C. Slater', 'A.C. Slater', '315', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'Jessie Spano', 'Jessie Spano', '316', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'Screech Powers', 'Screech Powers', '317', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'Lisa Turtle', 'Lisa Turtle', '318', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell original wave checklist item.'),
    ('Saved By The Bell', 'Mr. Belding', 'Mr. Belding', '1574', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell newer wave checklist item.'),
    ('Saved By The Bell', 'Zach Morris', 'Zach Morris', '1575', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell newer wave checklist item; source spells Zach without k.'),
    ('Saved By The Bell', 'Kelly Kapowski', 'Kelly Kapowski', '1576', 'Common', null, 'Pop! Television', 'Standard', 'https://www.cardboardconnection.com/2015-funko-pop-saved-by-bell-vinyl-figures', 0.90::numeric, 'Saved by the Bell newer wave checklist item.')
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join target_sets on target_sets.canonical_name = checklist.set_name
  left join public.pop_catalog pc
    on lower(pc.set_name) = lower(checklist.set_name)
    and pc.number = checklist.number_value
    and (
      lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
      or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
      or checklist.set_name = 'Saved By The Bell'
    )
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
  null,
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
  pop_catalog_id = excluded.pop_catalog_id,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
