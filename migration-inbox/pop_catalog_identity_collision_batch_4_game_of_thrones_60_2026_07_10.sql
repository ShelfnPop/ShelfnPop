-- Applied Batch 4 Game of Thrones #60 review, 2026-07-10.
-- Repairs Giant Wight, the Amazon glow Ride, and crossed common/glow checklist links.

begin;

with reviewed(upc, override_data, catalog_value, collection_value, owned_variant, notes) as (
  values
    (
      '889698285001',
      jsonb_build_object(
        'pop_name','Giant Wight','character','Giant Wight','franchise','Game of Thrones',
        'set_name','Game of Thrones','number','60','variant',null,
        'exclusivity','Emerald City Comic Con / FYE','pop_type','Pop! Television','pop_style','Jumbo',
        'vault_status','Active','release_date','2018-01-01','estimated_value',16.99,
        'description','Giant Wight is a Game of Thrones 6-inch Pop! Television release #60, Emerald City Comic Con and FYE shared exclusive.',
        'display_description','Giant Wight is a Game of Thrones 6-inch Pop! Television release #60, Emerald City Comic Con and FYE shared exclusive. Released in 2018.',
        'parse_confidence',0.98,'needs_review',false
      ),
      16.99::numeric,16.99::numeric,'Common',
      'Verified 2018 Emerald City Comic Con 6-inch Giant Wight shared with FYE; distinct from Pop! Rides #60.'
    ),
    (
      '889698376693',
      jsonb_build_object(
        'pop_name','Mounted White Walker','character','Mounted White Walker','franchise','Game of Thrones',
        'set_name','Game of Thrones','number','60','variant','Glow in the Dark','exclusivity','Amazon',
        'pop_type','Pop! Rides','pop_style','Ride','vault_status','Vaulted',
        'release_date','2019-01-01','estimated_value',29.99,
        'description','Mounted White Walker is a vaulted Game of Thrones Pop! Rides release #60, Glow in the Dark and Amazon exclusive.',
        'display_description','Mounted White Walker is a vaulted Game of Thrones Pop! Rides release #60, Glow in the Dark and Amazon exclusive. Released in 2019.',
        'parse_confidence',0.98,'needs_review',false
      ),
      29.99::numeric,29.99::numeric,'Glow in the Dark',
      'Verified Amazon Glow in the Dark Ride #60 and official Funko vaulted status; distinct from common UPC 889698431071.'
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
  from reviewed r where p.upc=r.upc
  returning p.id,p.upc
), updated_collection as (
  update public.user_collection_items u
  set current_value=r.collection_value, owned_variant=r.owned_variant
  from updated_catalog c join reviewed r using(upc)
  where u.pop_catalog_id=c.id returning u.id
), updated_checklist_common as (
  update public.pop_set_checklist_items
  set pop_catalog_id=null, upc='889698431071', updated_at=now(),
      notes='Hero Habit Pop Rides checklist row. Common Ride UPC verified separately from the Amazon Glow in the Dark release.'
  where id='0f1bb97c-6caf-4578-977c-624ce78c1600' returning id
), updated_checklist_glow as (
  update public.pop_set_checklist_items i
  set pop_catalog_id=c.id, upc='889698376693', updated_at=now(),
      notes='Hero Habit Pop Rides checklist row. Amazon Glow in the Dark UPC verified and linked to its catalog identity.'
  from updated_catalog c
  where i.id='09fbf4cb-ee18-4eff-b2e0-39a4b7f3edd0' and c.upc='889698376693'
  returning i.id
)
insert into public.catalog_parser_overrides(upc,pop_catalog_id,override_data,notes,is_active)
select r.upc,c.id,r.override_data,r.notes,true from reviewed r join updated_catalog c using(upc)
on conflict(upc) do update
set pop_catalog_id=excluded.pop_catalog_id, override_data=excluded.override_data,
    notes=excluded.notes, is_active=true, updated_at=now();

commit;

