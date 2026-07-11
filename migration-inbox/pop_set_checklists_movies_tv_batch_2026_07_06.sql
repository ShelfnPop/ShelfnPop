with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('The Princess Bride', 'The Princess Bride', 'reviewed', 'Cardboard Connection Princess Bride checklist', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90, now(), 'Reviewed checklist includes Buttercup #578, Westley #579, Westley Chase #579, Inigo Montoya #580, and Fezzik #1023.'),
    ('Forrest Gump', 'Forrest Gump', 'reviewed', 'Figure Realm Forrest Gump Pop! Vinyl checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90, now(), 'Reviewed Pop! Vinyl checklist includes Box of Chocolates #769, Ping Pong Set #770, Ping Pong #770, Beard #771, and Medal #789. Blockbuster Rewind items intentionally excluded from this set total.'),
    ('Lost', 'Lost', 'reviewed', 'Figure Realm Lost checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92, now(), 'Reviewed checklist includes Jack #414, Kate #415, Sawyer #416, John Locke #417, Hurley #418, Jacob #419, and Man in Black #420.'),
    ('Edward Scissorhands', 'Edward Scissorhands', 'reviewed', 'Figure Realm Edward Scissorhands checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92, now(), 'Reviewed checklist includes #17 and 2020 wave #979-985 plus Inventor #1006.')
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
  select id, canonical_name from public.pop_sets where canonical_name in ('The Princess Bride', 'Forrest Gump', 'Lost', 'Edward Scissorhands')
), checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('The Princess Bride', 'Buttercup', 'Buttercup', '578', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90::numeric, 'Princess Bride checklist item.'),
    ('The Princess Bride', 'Westley', 'Westley', '579', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90::numeric, 'Princess Bride checklist item.'),
    ('The Princess Bride', 'Westley', 'Westley', '579', 'Chase', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90::numeric, 'Princess Bride Westley chase checklist item.'),
    ('The Princess Bride', 'Inigo Montoya', 'Inigo Montoya', '580', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90::numeric, 'Princess Bride checklist item.'),
    ('The Princess Bride', 'Fezzik', 'Fezzik', '1023', 'Common', 'New York Comic Con', 'Pop! Movies', 'Standard', 'https://www.cardboardconnection.com/funko-pop-the-princess-bride-vinyl-figures', 0.90::numeric, 'Princess Bride Fezzik checklist item.'),
    ('Forrest Gump', 'Forrest Gump (Box of Chocolates)', 'Forrest Gump', '769', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90::numeric, 'Forrest Gump Pop! Vinyl checklist item.'),
    ('Forrest Gump', 'Forrest Gump (Ping Pong Set)', 'Forrest Gump', '770', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90::numeric, 'Forrest Gump Ping Pong Set checklist item.'),
    ('Forrest Gump', 'Forrest Gump (Ping Pong)', 'Forrest Gump', '770', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90::numeric, 'Forrest Gump Ping Pong checklist item.'),
    ('Forrest Gump', 'Forrest Gump (Beard)', 'Forrest Gump', '771', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90::numeric, 'Forrest Gump Beard checklist item.'),
    ('Forrest Gump', 'Forrest Gump (Medal)', 'Forrest Gump', '789', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1910&ssid=2', 0.90::numeric, 'Forrest Gump Medal checklist item.'),
    ('Lost', 'Jack Shephard', 'Jack Shephard', '414', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'Kate Austen', 'Kate Austen', '415', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'Sawyer (James Ford)', 'Sawyer James Ford', '416', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'John Locke', 'John Locke', '417', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'Hurley (Hugo Reyes)', 'Hurley', '418', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'Jacob', 'Jacob', '419', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Lost', 'Man in Black', 'Man in Black', '420', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3132&mode=2&series=lostfunko', 0.92::numeric, 'Lost checklist item.'),
    ('Edward Scissorhands', 'Edward Scissorhands', 'Edward Scissorhands', '17', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands original checklist item.'),
    ('Edward Scissorhands', 'Edward Scissorhands', 'Edward Scissorhands', '979', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Edward in Dress Clothes', 'Edward in Dress Clothes', '980', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Kim Boggs', 'Kim Boggs', '981', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Edward with Kabobs', 'Edward with Kabobs', '982', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Edward in Face Mask', 'Edward in Face Mask', '983', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Edward with Kirigami', 'Edward With Kirigami', '984', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Edward w/ Dinosaur Shrub', 'Edward w/ Dinosaur Shrub', '985', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.'),
    ('Edward Scissorhands', 'Inventor', 'Inventor', '1006', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1644&mode=3&series=edwardscissorhandsfunko', 0.92::numeric, 'Edward Scissorhands checklist item.')
)
insert into public.pop_set_checklist_items (set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
select
  target_sets.id,
  pc.id,
  null,
  checklist.pop_name,
  checklist.character_name,
  checklist.number_value,
  checklist.variant_value,
  checklist.exclusivity_value,
  checklist.pop_type_value,
  checklist.pop_style_value,
  true,
  checklist.source_url,
  checklist.confidence_value,
  checklist.notes_value
from checklist
join target_sets on target_sets.canonical_name = checklist.set_name
left join public.pop_catalog pc
  on lower(pc.set_name) = lower(checklist.set_name)
  and pc.number = checklist.number_value
  and (
    lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
    or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
    or lower(coalesce(pc.pop_name, pc.character, '')) like '%' || lower(split_part(checklist.pop_name, ' ', 1)) || '%'
  )
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
