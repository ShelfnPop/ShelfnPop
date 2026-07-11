-- First focused exclusivity backfill pass.
-- Uses explicit retailer/convention/program wording from raw_title, clean_title,
-- and description. Avoids downgrading specific conventions to generic "Exclusive".

with inferred as (
  select
    pc.id,
    case
      when haystack like '%san diego comic-con%' or haystack like '%san diego comic con%' or haystack like '% sdcc %' or haystack like 'sdcc %' or haystack like '% sdcc' then 'San Diego Comic-Con'
      when haystack like '%new york comic con%' or haystack like '% nycc %' or haystack like 'nycc %' or haystack like '% nycc' then 'New York Comic Con'
      when haystack like '%emerald city comic con%' or haystack like '% eccc %' or haystack like 'eccc %' or haystack like '% eccc' then 'Emerald City Comic Con'
      when haystack like '%wondercon%' or haystack like '%wonder con%' then 'WonderCon'
      when haystack like '% d23 %' or haystack like 'd23 %' or haystack like '% d23' then 'D23'
      when haystack like '%target con%' then 'Target Con'
      when haystack like '%summer convention%' then 'Summer Convention'
      when haystack like '%fall convention%' or haystack like '%fall con%' then 'Fall Convention'
      when haystack like '%spring convention%' then 'Spring Convention'
      when haystack like '%winter convention%' then 'Winter Convention'
      when haystack like '%funko shop%' or haystack like '%funko exclusive%' then 'Funko Shop'
      when haystack like '%boxlunch%' or haystack like '%box lunch%' then 'BoxLunch'
      when haystack like '%hot topic%' then 'Hot Topic'
      when haystack like '%gamestop%' or haystack like '%game stop%' then 'GameStop'
      when haystack like '% target %' or haystack like 'target %' or haystack like '% target' then 'Target'
      when haystack like '%walmart%' then 'Walmart'
      when haystack like '%walgreens%' then 'Walgreens'
      when haystack like '%amazon%' then 'Amazon'
      when haystack like '%entertainment earth%' then 'Entertainment Earth'
      when haystack like '% fye %' or haystack like 'fye %' or haystack like '% fye' then 'FYE'
      when haystack like '%barnes & noble%' or haystack like '%barnes and noble%' then 'Barnes & Noble'
      when haystack like '%px previews%' or haystack like '%px exclusive%' or haystack like '%previews exclusive%' then 'PX Previews'
      when haystack like '%specialty series%' then 'Specialty Series'
      when haystack like '%collector''s corps%' or haystack like '%collectors corps%' or haystack like '%marvel collector corps%' then 'Collectors Corps'
      when haystack like '%toy sapiens%' then 'Toy Sapiens'
      when haystack like '%aaa anime exclusive%' or haystack like '%aaa exclusive%' then 'AAA Anime Exclusive'
      when haystack like '%us exclusive%' then 'US Exclusive'
      when haystack like '%exclusive%' then 'Exclusive'
      else null
    end as inferred_exclusivity
  from (
    select
      id,
      lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(description, '')) as haystack
    from public.pop_catalog
  ) pc
)
update public.pop_catalog pc
set exclusivity = inferred.inferred_exclusivity
from inferred
where pc.id = inferred.id
  and inferred.inferred_exclusivity is not null
  and coalesce(pc.exclusivity, '') <> inferred.inferred_exclusivity
  and (
    pc.exclusivity is null
    or pc.exclusivity in ('Exclusive', 'Convention')
    or (pc.exclusivity = 'Target' and inferred.inferred_exclusivity = 'Target Con')
    or (pc.exclusivity = 'Amazon' and inferred.inferred_exclusivity = 'US Exclusive')
  );
