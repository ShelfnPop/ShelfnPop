-- Applied Batch 4 Batman 1989 identity-collision repair, 2026-07-10.
-- Keeps the base/chase, standalone Metallic, and 2-Pack identities separate.

begin;

with reviewed(upc, override_data, catalog_value, collection_value, notes) as (
  values
    (
      '889698477093',
      jsonb_build_object(
        'pop_name','The Joker (Batman 1989)','character','The Joker','franchise','DC',
        'set_name','Batman 1989','number','337','variant',null,'exclusivity',null,
        'pop_type','Pop! Heroes','pop_style','Standard','vault_status','Active',
        'estimated_value',10.00,
        'description','The Joker is a Batman 1989 Pop! Heroes release #337 with a chance of Chase.',
        'display_description','The Joker is a Batman 1989 Pop! Heroes release #337 with a chance of Chase.',
        'parse_confidence',0.98,'needs_review',false
      ),
      10.00::numeric, 19.37::numeric,
      'Verified base chance-of-Chase UPC. Catalog holds the common baseline; owned Chase identity and value remain item-level.'
    ),
    (
      '889698495776',
      jsonb_build_object(
        'pop_name','The Joker (Batman 1989)','character','The Joker','franchise','DC',
        'set_name','Batman 1989','number','337','variant','Metallic','exclusivity','GameStop',
        'pop_type','Pop! Heroes','pop_style','Standard','vault_status','Active',
        'estimated_value',15.24,
        'description','The Joker is a Batman 1989 Pop! Heroes release #337, Metallic, GameStop exclusive.',
        'display_description','The Joker is a Batman 1989 Pop! Heroes release #337, Metallic, GameStop exclusive.',
        'parse_confidence',0.98,'needs_review',false
      ),
      15.24::numeric, 15.24::numeric,
      'Verified standalone Metallic GameStop release; variant is stored separately from the canonical name.'
    ),
    (
      '889698584470',
      jsonb_build_object(
        'pop_name','Batman & The Joker (2-Pack)','character','Batman & The Joker','franchise','DC',
        'set_name','Batman 1989','number',null,'variant',null,'exclusivity','GameStop',
        'pop_type','Pop! Heroes','pop_style','2-Pack','vault_status','Active',
        'estimated_value',18.40,
        'description','Batman & The Joker is an unnumbered Batman 1989 Pop! Heroes 2-Pack, GameStop exclusive.',
        'display_description','Batman & The Joker is an unnumbered Batman 1989 Pop! Heroes 2-Pack, GameStop exclusive.',
        'parse_confidence',0.98,'needs_review',false
      ),
      18.40::numeric, 18.40::numeric,
      'Verified Batman & The Joker GameStop 2-Pack; it is not box #337.'
    )
), updated_catalog as (
  update public.pop_catalog p
  set pop_name = r.override_data->>'pop_name',
      character = r.override_data->>'character',
      franchise = r.override_data->>'franchise',
      set_name = r.override_data->>'set_name',
      number = r.override_data->>'number',
      variant = r.override_data->>'variant',
      exclusivity = r.override_data->>'exclusivity',
      pop_type = r.override_data->>'pop_type',
      pop_style = r.override_data->>'pop_style',
      vault_status = r.override_data->>'vault_status',
      estimated_value = r.catalog_value,
      clean_title = case when p.upc = '889698584470'
        then 'Batman & The Joker (2-Pack)'
        else 'The Joker (Batman 1989) #337'
      end,
      description = r.override_data->>'description',
      display_description = r.override_data->>'display_description',
      parse_confidence = 0.98,
      parse_reason_codes = '{}'::text[],
      needs_review = false,
      api_last_updated = now()
  from reviewed r
  where p.upc = r.upc
  returning p.id, p.upc
), updated_collection as (
  update public.user_collection_items u
  set current_value = r.collection_value
  from updated_catalog c
  join reviewed r using (upc)
  where u.pop_catalog_id = c.id
  returning u.id
)
insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
select r.upc, c.id, r.override_data, r.notes, true
from reviewed r
join updated_catalog c using (upc)
on conflict (upc) do update
set pop_catalog_id = excluded.pop_catalog_id,
    override_data = excluded.override_data,
    notes = excluded.notes,
    is_active = true,
    updated_at = now();

commit;

