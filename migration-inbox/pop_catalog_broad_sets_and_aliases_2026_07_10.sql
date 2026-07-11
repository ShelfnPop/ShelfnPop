-- Applied broad-set cleanup and canonical label normalization, 2026-07-10.

begin;

with reviewed(upc, override_data, notes) as (
  values
    ('830395024684', jsonb_build_object('pop_name','Jack Skellington','character','Jack Skellington','franchise','Disney','set_name','The Nightmare Before Christmas','number','15','pop_type','Pop! Disney','pop_style','Standard','description','Jack Skellington is a Disney The Nightmare Before Christmas Pop! release #15.','display_description','Jack Skellington is a Disney The Nightmare Before Christmas Pop! release #15.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Disney set to verified film set.'),
    ('849803036577', jsonb_build_object('pop_name','Jack Skellington','character','Jack Skellington','franchise','Disney','set_name','The Nightmare Before Christmas','number','69','variant','Glow in the Dark','pop_type','Pop! Disney','pop_style','Standard','description','Jack Skellington is a Disney The Nightmare Before Christmas Pop! release #69, Glow in the Dark.','display_description','Jack Skellington is a Disney The Nightmare Before Christmas Pop! release #69, Glow in the Dark.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Disney set to verified film set.'),
    ('889698291743', jsonb_build_object('pop_name','Mickey Mouse','character','Mickey Mouse','franchise','Disney','set_name','Mickey Mouse','number','01','variant','Diamond Glitter Gold','exclusivity','Barnes & Noble','pop_type','Pop! Disney','pop_style','Standard','description','Mickey Mouse is a Disney Pop! release #01, Diamond Glitter Gold and Barnes & Noble exclusive.','display_description','Mickey Mouse is a Disney Pop! release #01, Diamond Glitter Gold and Barnes & Noble exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Disney set to Mickey Mouse character set.'),
    ('889698764346', jsonb_build_object('pop_name','Mickey Mouse (Easter Chocolate)','character','Mickey Mouse','franchise','Disney','set_name','Mickey Mouse','number','1378','variant','Chocolate','pop_type','Pop! Disney','pop_style','Standard','description','Mickey Mouse (Easter Chocolate) is a Disney Pop! release #1378.','display_description','Mickey Mouse (Easter Chocolate) is a Disney Pop! release #1378.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Disney set to Mickey Mouse character set.'),
    ('889698601214', jsonb_build_object('pop_name','Bo-Katan Kryze','character','Bo-Katan Kryze','franchise','Star Wars','set_name','Star Wars Valentines','number','497','variant','Valentine','exclusivity','Funko Shop','pop_type','Pop! Star Wars','pop_style','Standard','description','Bo-Katan Kryze is a Star Wars Valentines Pop! release #497, Funko Shop exclusive.','display_description','Bo-Katan Kryze is a Star Wars Valentines Pop! release #497, Funko Shop exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to verified Valentines release.'),
    ('889698641258', jsonb_build_object('pop_name','Luke Skywalker','character','Luke Skywalker','franchise','Star Wars','set_name','Star Wars: A New Hope','number','511','variant',null,'exclusivity','Galactic Convention','pop_type','Pop! Star Wars','pop_style','Standard','description','Luke Skywalker is a Star Wars: A New Hope Pop! release #511, 2022 Galactic Convention exclusive.','display_description','Luke Skywalker is a Star Wars: A New Hope Pop! release #511, 2022 Galactic Convention exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to A New Hope.'),
    ('889698919463', jsonb_build_object('pop_name','Maul (with Robe)','character','Maul','franchise','Star Wars','set_name','Star Wars: Maul - Shadow Lord','number','831','variant','With Robe','exclusivity','Funko Shop','pop_type','Pop! Star Wars','pop_style','Standard','description','Maul (with Robe) is a Star Wars: Maul - Shadow Lord Pop! release #831, Funko Shop exclusive.','display_description','Maul (with Robe) is a Star Wars: Maul - Shadow Lord Pop! release #831, Funko Shop exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to Maul - Shadow Lord.'),
    ('889698920162', jsonb_build_object('pop_name','Mara Jade (Legends)','character','Mara Jade','franchise','Star Wars','set_name','Star Wars Legends','number','839','variant','Legends','exclusivity','Specialty Series','pop_type','Pop! Star Wars','pop_style','Standard','description','Mara Jade (Legends) is a Star Wars Legends Pop! release #839, Specialty Series exclusive.','display_description','Mara Jade (Legends) is a Star Wars Legends Pop! release #839, Specialty Series exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to Star Wars Legends.'),
    ('889698885720', jsonb_build_object('pop_name','Yaddle','character','Yaddle','franchise','Star Wars','set_name','Star Wars: Tales of the Jedi','number','811','variant',null,'exclusivity','Target','pop_type','Pop! Star Wars','pop_style','Standard','description','Yaddle is a Star Wars: Tales of the Jedi Pop! release #811, Target exclusive.','display_description','Yaddle is a Star Wars: Tales of the Jedi Pop! release #811, Target exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to Tales of the Jedi.'),
    ('889698885751', jsonb_build_object('pop_name','BB-8 (Retro)','character','BB-8','franchise','Star Wars','set_name','Star Wars: Retro Series','number','804','variant','Retro','exclusivity','Target','pop_type','Pop! Star Wars','pop_style','Standard','description','BB-8 (Retro) is a Star Wars: Retro Series Pop! release #804, Target exclusive.','display_description','BB-8 (Retro) is a Star Wars: Retro Series Pop! release #804, Target exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to Retro Series.'),
    ('889698885768', jsonb_build_object('pop_name','Rey (Retro)','character','Rey','franchise','Star Wars','set_name','Star Wars: Retro Series','number','805','variant','Retro','exclusivity','Target','pop_type','Pop! Star Wars','pop_style','Standard','description','Rey (Retro) is a Star Wars: Retro Series Pop! release #805, Target exclusive.','display_description','Rey (Retro) is a Star Wars: Retro Series Pop! release #805, Target exclusive.','parse_confidence',0.98,'needs_review',false), 'Moved from broad Star Wars set to Retro Series.')
), updated_catalog as (
  update public.pop_catalog p
  set pop_name = r.override_data->>'pop_name',
      character = r.override_data->>'character',
      franchise = r.override_data->>'franchise',
      set_name = r.override_data->>'set_name',
      number = r.override_data->>'number',
      variant = case when r.override_data ? 'variant' then r.override_data->>'variant' else p.variant end,
      exclusivity = case when r.override_data ? 'exclusivity' then r.override_data->>'exclusivity' else p.exclusivity end,
      pop_type = r.override_data->>'pop_type',
      pop_style = r.override_data->>'pop_style',
      description = r.override_data->>'description',
      display_description = r.override_data->>'display_description',
      parse_confidence = 0.98,
      parse_reason_codes = '{}'::text[],
      needs_review = false,
      api_last_updated = now()
  from reviewed r
  where p.upc = r.upc
  returning p.upc, p.id
), upserted_overrides as (
  insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
  select r.upc, u.id, r.override_data, r.notes, true
  from reviewed r
  join updated_catalog u using (upc)
  on conflict (upc) do update
  set pop_catalog_id = excluded.pop_catalog_id,
      override_data = excluded.override_data,
      notes = excluded.notes,
      is_active = true,
      updated_at = now()
  returning upc
)
select count(*) from upserted_overrides;

update public.pop_catalog
set set_name = case set_name
  when 'DC Superheroes' then 'DC Super Heroes'
  when 'What If' then 'What If...?'
  when 'Shazam! Fury Of The Gods' then 'Shazam! Fury of the Gods'
  when 'Rick And Morty' then 'Rick and Morty'
  when 'Star Wars: Return Of The Jedi 40th Anniversary' then 'Star Wars: Return of the Jedi 40th Anniversary'
  when 'Nightmare Before Christmas' then 'The Nightmare Before Christmas'
  when 'Star Wars Retro' then 'Star Wars: Retro Series'
  when 'Star Wars: Retro Series. Targer' then 'Star Wars: Retro Series'
  else set_name
end,
api_last_updated = now()
where set_name in (
  'DC Superheroes','What If','Shazam! Fury Of The Gods','Rick And Morty',
  'Star Wars: Return Of The Jedi 40th Anniversary','Nightmare Before Christmas',
  'Star Wars Retro','Star Wars: Retro Series. Targer'
);

update public.catalog_parser_overrides
set override_data = jsonb_set(
      override_data,
      '{set_name}',
      to_jsonb(case override_data->>'set_name'
        when 'DC Superheroes' then 'DC Super Heroes'
        when 'What If' then 'What If...?'
        when 'Shazam! Fury Of The Gods' then 'Shazam! Fury of the Gods'
        when 'Rick And Morty' then 'Rick and Morty'
        when 'Star Wars: Return Of The Jedi 40th Anniversary' then 'Star Wars: Return of the Jedi 40th Anniversary'
        when 'Nightmare Before Christmas' then 'The Nightmare Before Christmas'
        when 'Star Wars Retro' then 'Star Wars: Retro Series'
        when 'Star Wars: Retro Series. Targer' then 'Star Wars: Retro Series'
      end),
      true
    ),
    updated_at = now()
where is_active
  and override_data->>'set_name' in (
    'DC Superheroes','What If','Shazam! Fury Of The Gods','Rick And Morty',
    'Star Wars: Return Of The Jedi 40th Anniversary','Nightmare Before Christmas',
    'Star Wars Retro','Star Wars: Retro Series. Targer'
  );

commit;
