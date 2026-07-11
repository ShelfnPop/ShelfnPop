-- Applied Batch 4 Harry Potter #175 review, 2026-07-10.
-- Keeps Gingerbread Harry separate from the Amazon Pop! Movie Poster release.

begin;

with reviewed(upc, override_data, catalog_value, collection_value, owned_variant, notes) as (
  values
    (
      '889698800181',
      jsonb_build_object(
        'pop_name','Harry Potter (Gingerbread)','character','Harry Potter','franchise','Wizarding World',
        'set_name','Harry Potter','number','175','variant','Gingerbread','exclusivity',null,
        'pop_type','Pop! Movies','pop_style','Standard','vault_status','Active',
        'release_date','2024-12-01','estimated_value',14.00,
        'description','Harry Potter (Gingerbread) is a Wizarding World Pop! Movies release #175 from Harry Potter.',
        'display_description','Harry Potter (Gingerbread) is a Wizarding World Pop! Movies release #175 from Harry Potter. Released in 2024.',
        'parse_confidence',0.98,'needs_review',false
      ),
      14.00::numeric,14.00::numeric,'Gingerbread',
      'Verified December 2024 Gingerbread Harry Potter standard Pop #175; distinct from Movie Poster #175.'
    ),
    (
      '889698816885',
      jsonb_build_object(
        'pop_name','Undesirable No. 1 Harry Potter','character','Harry Potter','franchise','Wizarding World',
        'set_name','Harry Potter','number','175','variant',null,'exclusivity','Amazon',
        'pop_type','Pop! Movie Posters','pop_style','Movie Poster','vault_status','Active',
        'release_date','2024-08-01','estimated_value',15.02,
        'description','Undesirable No. 1 Harry Potter is a Wizarding World Pop! Movie Poster release #175 from Harry Potter, Amazon exclusive.',
        'display_description','Undesirable No. 1 Harry Potter is a Wizarding World Pop! Movie Poster release #175 from Harry Potter, Amazon exclusive. Released in 2024.',
        'parse_confidence',0.98,'needs_review',false
      ),
      15.02::numeric,15.02::numeric,'Common',
      'Verified Funko Pop! Movie Posters subtype, Amazon exclusivity, and August 2024 release; intentionally outside the main Harry Potter checklist denominator.'
    )
), updated_catalog as (
  update public.pop_catalog p
  set pop_name=r.override_data->>'pop_name', character=r.override_data->>'character',
      franchise=r.override_data->>'franchise', set_name=r.override_data->>'set_name',
      number=r.override_data->>'number', variant=r.override_data->>'variant',
      exclusivity=r.override_data->>'exclusivity', pop_type=r.override_data->>'pop_type',
      pop_style=r.override_data->>'pop_style', vault_status=r.override_data->>'vault_status',
      release_date=(r.override_data->>'release_date')::date, estimated_value=r.catalog_value,
      description=r.override_data->>'description', display_description=r.override_data->>'display_description',
      parse_confidence=0.98, parse_reason_codes='{}'::text[], needs_review=false, api_last_updated=now()
  from reviewed r where p.upc=r.upc returning p.id,p.upc
), updated_collection as (
  update public.user_collection_items u
  set current_value=r.collection_value, owned_variant=r.owned_variant
  from updated_catalog c join reviewed r using(upc)
  where u.pop_catalog_id=c.id returning u.id
)
insert into public.catalog_parser_overrides(upc,pop_catalog_id,override_data,notes,is_active)
select r.upc,c.id,r.override_data,r.notes,true from reviewed r join updated_catalog c using(upc)
on conflict(upc) do update
set pop_catalog_id=excluded.pop_catalog_id, override_data=excluded.override_data,
    notes=excluded.notes, is_active=true, updated_at=now();

commit;

