begin;

update public.pop_catalog
set franchise = case set_name
    when 'South Park' then 'South Park'
    when 'The Goonies' then 'The Goonies'
    when 'Super Troopers' then 'Super Troopers'
    when 'Spyro' then 'Spyro'
    when 'Willow' then 'Willow'
    else franchise
  end,
  api_last_updated = now()
where nullif(btrim(franchise), '') is null
  and set_name in ('South Park', 'The Goonies', 'Super Troopers', 'Spyro', 'Willow');

commit;
