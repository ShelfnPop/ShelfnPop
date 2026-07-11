-- Applied Batch 4 Game of Thrones #67 review, 2026-07-10.
-- Bran Stark is Standard #67; Jon Snow & Rhaegal is Pop! Rides #67.

begin;

with reviewed(upc, override_data, catalog_value, collection_value, notes) as (
  values
    (
      '889698346184',
      jsonb_build_object(
        'pop_name','Bran Stark','character','Bran Stark','franchise','Game of Thrones',
        'set_name','Game of Thrones','number','67','variant','Three-Eyed Raven',
        'exclusivity',null,'pop_type','Pop! Television','pop_style','Standard',
        'vault_status','Active','release_date','2018-10-01','estimated_value',5.75,
        'description','Bran Stark is a Game of Thrones Pop! Television release #67, Three-Eyed Raven variant.',
        'display_description','Bran Stark is a Game of Thrones Pop! Television release #67, Three-Eyed Raven variant. Released in 2018.',
        'parse_confidence',0.98,'needs_review',false
      ),
      5.75::numeric, 5.75::numeric,
      'Verified standard Pop #67 identity and Three-Eyed Raven variant; distinct from Pop! Rides #67.'
    ),
    (
      '889698444484',
      jsonb_build_object(
        'pop_name','Jon Snow & Rhaegal','character','Jon Snow & Rhaegal','franchise','Game of Thrones',
        'set_name','Game of Thrones','number','67','variant',null,
        'exclusivity',null,'pop_type','Pop! Rides','pop_style','Ride',
        'vault_status','Active','release_date','2019-08-12','estimated_value',44.50,
        'description','Jon Snow & Rhaegal is a Game of Thrones Pop! Rides release #67.',
        'display_description','Jon Snow & Rhaegal is a Game of Thrones Pop! Rides release #67. Released in 2019.',
        'parse_confidence',0.98,'needs_review',false
      ),
      44.50::numeric, 44.50::numeric,
      'Verified Pop! Rides #67 identity; legitimate cross-line number reuse with Bran Stark #67.'
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
      release_date = (r.override_data->>'release_date')::date,
      estimated_value = r.catalog_value,
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

-- Product-line-aware collision review key:
-- lower(set_name), number, lower(pop_type), lower(pop_style)

