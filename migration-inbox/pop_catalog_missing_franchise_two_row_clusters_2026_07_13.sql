-- Shelf-n-Pop catalog health follow-up: missing-franchise two-row clusters.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Eight exact UPCs from the 2026-07-13 weekly health check where franchise
--   was null and the source identity is compact/source-verifiable.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(
  upc, pop_name, character, franchise, set_name, set_total, number, variant,
  exclusivity, pop_type, pop_style, notes
) as (
  values
    ('889698863360','Casper (30th Anniversary)','Casper','Casper the Friendly Ghost','Casper 30th Anniversary',2,'1848',null,null,'Pop! Movies','Standard','2026-07-13 missing-franchise two-row cluster; Casper #1848.'),
    ('889698863384','Kat Harvey (30th Anniversary)','Kat Harvey','Casper the Friendly Ghost','Casper 30th Anniversary',2,'1849',null,null,'Pop! Movies','Standard','2026-07-13 missing-franchise two-row cluster; Kat Harvey #1849.'),
    ('889698862783','Boots','Boots','Nickelodeon','Dora the Explorer',null,'2004',null,null,'Pop! Animation','Standard','2026-07-13 missing-franchise two-row cluster; Dora the Explorer Boots #2004.'),
    ('889698862806','Swiper','Swiper','Nickelodeon','Dora the Explorer',null,'2005',null,null,'Pop! Animation','Standard','2026-07-13 missing-franchise two-row cluster; Dora the Explorer Swiper #2005.'),
    ('889698490474','Andy Stitzer (Waxed)','Andy Stitzer','The 40-Year-Old Virgin','The 40-Year-Old Virgin',null,'1063','Waxed',null,'Pop! Movies','Standard','2026-07-13 missing-franchise two-row cluster; The 40-Year-Old Virgin Andy Stitzer Waxed #1063.'),
    ('889698544696','Andy Stitzer (Holding Steve Austin)','Andy Stitzer','The 40-Year-Old Virgin','The 40-Year-Old Virgin',null,'1064','Holding Steve Austin',null,'Pop! Movies','Standard','2026-07-13 missing-franchise two-row cluster; The 40-Year-Old Virgin Andy Stitzer #1064 chase/variant.'),
    ('889698252027','Ezekiel','Ezekiel','The Walking Dead','The Walking Dead',null,'574',null,null,'Pop! Television','Standard','2026-07-13 missing-franchise two-row cluster; The Walking Dead Ezekiel #574.'),
    ('889698435314','Daryl Dixon','Daryl Dixon','The Walking Dead','The Walking Dead',null,'889',null,null,'Pop! Television','Standard','2026-07-13 missing-franchise two-row cluster; The Walking Dead Daryl Dixon #889.')
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
    set_total = coalesce(p.set_total, pc.set_total),
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
  cpo.override_data->>'franchise' as override_franchise
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698863360','889698863384',
  '889698862783','889698862806',
  '889698490474','889698544696',
  '889698252027','889698435314'
)
order by pc.franchise, pc.number;
