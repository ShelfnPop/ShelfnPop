-- Shelf-n-Pop catalog set_name backfill - first conservative pass.
-- Applied to live Supabase on 2026-07-05.
-- Scope: only missing set_name rows where raw_title/clean_title clearly names the set.

with proposed as (
  select
    id,
    case
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%doctor strange in the multiverse of madness%' then 'Doctor Strange in the Multiverse of Madness'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%thor: love%' or lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%love and thunder%' then 'Thor: Love and Thunder'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%marvel zombies%' or lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%marvel: zombies%' then 'Marvel Zombies'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%x-men ''97%' then 'X-Men ''97'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%x-men classic%' then 'X-Men'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%avengers 4: endgame%' then 'Avengers: Endgame'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%year of the spider%' then 'Year of the Spider'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%sinister six%' then 'Sinister Six'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%deadpool parody%' then 'Deadpool Parody'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%the mandalorian%' then 'The Mandalorian'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%skeleton crew%' then 'Skeleton Crew'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%andor%' then 'Andor'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%episode viii%' then 'The Last Jedi'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%solo%' then 'Solo: A Star Wars Story'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%arkham city%' then 'Batman: Arkham City'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%supergirl%' then 'Supergirl'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%batman vs the penguin%' then 'Batman Classic TV Series'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%wish%' then 'Wish'
      when lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%game of thrones%' or lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(pop_name, '')) like '%thrones%' then 'Game of Thrones'
      else null
    end as suggested_set
  from public.pop_catalog
  where nullif(btrim(set_name), '') is null
)
update public.pop_catalog pc
set
  set_name = proposed.suggested_set,
  needs_review = false,
  api_last_updated = now()
from proposed
where pc.id = proposed.id
  and proposed.suggested_set is not null;
