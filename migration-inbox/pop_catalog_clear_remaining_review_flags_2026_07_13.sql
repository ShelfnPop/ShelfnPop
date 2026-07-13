-- Shelf-n-Pop catalog health follow-up: clear remaining current-window review flags.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Thirteen exact UPCs remaining with needs_review = true after missing-franchise
--   and missing-set cleanup in the 2026-07-13 weekly health check window.
--
-- Safety:
--   Exact UPC list only. No deletes. No value/image/UPC changes. Upserts active
--   catalog_parser_overrides so lookup_pop keeps reviewed identities.

with reviewed(
  upc, pop_name, character, franchise, set_name, set_total, number, variant,
  exclusivity, pop_type, pop_style, notes
) as (
  values
    ('889698127493','Mace Windu','Mace Windu','Star Wars','Star Wars',null,'172',null,'Walgreens','Pop! Star Wars','Standard','2026-07-13 review cleanup; stale review flag only, Mace Windu #172 Walgreens.'),
    ('889698716123','Darth Vader (Diamond Collection)','Darth Vader','Star Wars','Star Wars',null,'626','Diamond Collection','Funko Hollywood','Pop! Star Wars','Standard','2026-07-13 review cleanup; stale review flag only, Darth Vader Diamond #626 Funko Hollywood.'),
    ('889698922081','Scarlet Witch (Sketched Deco)','Scarlet Witch','Marvel','Marvel',null,'1575','Sketched Deco','Target','Pop! Marvel','Standard','2026-07-13 review cleanup; stale review flag only, Scarlet Witch Sketched Deco #1575 Target.'),
    ('830395032047','Carl','Carl Fredricksen','Disney','Up',null,'59',null,null,'Pop! Disney','Standard','2026-07-13 review cleanup; Funko official Carl page identifies Disney/Pixar UP, box #59.'),
    ('889698682503','Miles Morales Spider-Man','Miles Morales Spider-Man','Marvel','Spider-Man',null,'71','Comic Cover','Target','Pop! Comic Covers','Comic Cover','2026-07-13 review cleanup; Spider-Man #1 2016 comic cover / Miles Morales Target item.'),
    ('889698760270','Yelena Belova (Thunderbolts)','Yelena Belova','Marvel','Thunderbolts',null,'1481',null,null,'Pop! Marvel','Standard','2026-07-13 review cleanup; Funko official Thunderbolts Yelena #1481.'),
    ('889698760287','Red Guardian (Thunderbolts)','Red Guardian','Marvel','Thunderbolts',null,'1482',null,null,'Pop! Marvel','Standard','2026-07-13 review cleanup; Funko official Thunderbolts Red Guardian #1482.'),
    ('889698760294','Bucky Barnes (Thunderbolts)','Bucky Barnes','Marvel','Thunderbolts',null,'1483',null,null,'Pop! Marvel','Standard','2026-07-13 review cleanup; Thunderbolts Bucky Barnes #1483 grouped with official adjacent Funko Thunderbolts items.'),
    ('889698760300','John F. Walker (Thunderbolts)','John F. Walker','Marvel','Thunderbolts',null,'1484',null,null,'Pop! Marvel','Standard','2026-07-13 review cleanup; Funko official Thunderbolts John F. Walker #1484.'),
    ('889698860895','Jean Grey with Presents','Jean Grey','Marvel','X-Men',null,'1533','With Presents',null,'Pop! Marvel','Standard','2026-07-13 review cleanup; X-Men holiday/presents group, Jean Grey #1533.'),
    ('889698860901','Rogue with Presents','Rogue','Marvel','X-Men',null,'1534','With Presents',null,'Pop! Marvel','Standard','2026-07-13 review cleanup; Funko official Rogue with Presents #1534, Marvel/X-Men.'),
    ('889698860918','Storm with Presents','Storm','Marvel','X-Men',null,'1535','With Presents',null,'Pop! Marvel','Standard','2026-07-13 review cleanup; X-Men holiday/presents group, Storm #1535.'),
    ('889698648073','J. Jonah Jameson','J. Jonah Jameson','Marvel','Marvel',null,'1057',null,'Entertainment Earth','Pop! Marvel','Standard','2026-07-13 review cleanup; Funko official J. Jonah Jameson #1057 is Entertainment Earth exclusive; removed Special Edition variant noise.')
),
payload as (
  select
    *,
    jsonb_build_object(
      'pop_name', pop_name,
      'character', character,
      'franchise', franchise,
      'set_name', set_name,
      'set_total', set_total,
      'number', number,
      'variant', variant,
      'exclusivity', exclusivity,
      'pop_type', pop_type,
      'pop_style', pop_style,
      'description', pop_name || ' belongs to the ' || set_name || ' line as #' || number || '.',
      'display_description', pop_name || ' belongs to the ' || set_name || ' line as #' || number || '.',
      'parse_confidence', 0.98,
      'needs_review', false,
      'warnings', jsonb_build_array()
    ) as override_data
  from reviewed
),
updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = p.pop_name,
    character = p.character,
    franchise = p.franchise,
    set_name = p.set_name,
    set_total = coalesce(p.set_total::integer, pc.set_total),
    number = p.number,
    variant = p.variant,
    exclusivity = p.exclusivity,
    pop_type = p.pop_type,
    pop_style = p.pop_style,
    description = p.override_data->>'description',
    display_description = p.override_data->>'display_description',
    parse_confidence = 0.98,
    needs_review = false,
    parse_reason_codes = '{}'::text[],
    api_last_updated = now()
  from payload p
  where pc.upc = p.upc
  returning pc.id, pc.upc
),
upserted_overrides as (
  insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
  select p.upc, u.id, p.override_data, p.notes, true
  from payload p
  join updated_catalog u using (upc)
  on conflict (upc) do update
  set pop_catalog_id = excluded.pop_catalog_id,
      override_data = excluded.override_data,
      notes = excluded.notes,
      is_active = true,
      updated_at = now()
  returning upc
)
select
  (select count(*) from updated_catalog) as catalog_rows_updated,
  (select count(*) from upserted_overrides) as active_overrides_upserted;

select
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.set_name,
  pc.set_total,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_type,
  pc.pop_style,
  pc.needs_review,
  pc.parse_reason_codes,
  cpo.is_active as parser_override_active,
  cpo.override_data->>'set_name' as override_set_name,
  cpo.override_data->>'franchise' as override_franchise
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698127493',
  '889698716123',
  '889698922081',
  '830395032047',
  '889698682503',
  '889698760270',
  '889698760287',
  '889698760294',
  '889698760300',
  '889698860895',
  '889698860901',
  '889698860918',
  '889698648073'
)
order by pc.franchise, pc.set_name, pc.number;
