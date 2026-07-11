update public.pop_catalog
set
  set_name = case
    when pop_name ilike '%Concept Series%' or raw_title ilike '%Concept Series%' or clean_title ilike '%Concept Series%' then 'Star Wars Concept Series'
    when pop_name ilike '%Red Saber Series%' or raw_title ilike '%Red Saber Series%' or clean_title ilike '%Red Saber Series%' then 'Star Wars: Red Saber Series'
    when pop_name ilike '%Power Of The Galaxy%' or raw_title ilike '%Power of the Galaxy%' or clean_title ilike '%Power of the Galaxy%' then 'Star Wars: Power of the Galaxy'
    when pop_name ilike '%Holiday%' or raw_title ilike '%Star Wars Holiday%' or clean_title ilike '%Star Wars Holiday%' then 'Star Wars Holiday'
    when pop_name ilike '%Infinities%' or raw_title ilike '%Infinities%' or clean_title ilike '%Infinities%' then 'Star Wars Infinities'
    when raw_title ilike '%Rise Of Skywalker%' or clean_title ilike '%Rise Of Skywalker%' then 'Star Wars: The Rise of Skywalker'
    when set_name in ('Mandalorian', 'Macy''s Thanksgiving Parade. The Mandalorian') then 'The Mandalorian'
    when set_name = 'Star Wars. Special Edition' and (raw_title ilike '%Skeleton Crew%' or clean_title ilike '%Skeleton Crew%') then 'Skeleton Crew'
    when set_name = 'Solo A Star Wars Story' then 'Solo: A Star Wars Story'
    when set_name = 'Star Star Wars: The Force Awakens' then 'Star Wars: The Force Awakens'
    when set_name in ('Art Series. Star Wars', 'Art Series. Star Wars.', 'Star Wars Art Series') then 'Star Wars Art Series'
    when set_name = 'Impressions. Star Wars' then 'Star Wars Impressions'
    when set_name = 'Retro' then 'Star Wars Retro'
    when set_name = 'Funko Special Edition, Star Wars' then 'Star Wars'
    when set_name in ('Star Wars. Celebration 2015', 'Star Wars. Galactic Convention', 'Star Wars. Special Edition') then 'Star Wars'
    when set_name = 'Wal-Mart' then 'Star Wars: The Empire Strikes Back'
    when raw_title ilike '%Hoth%' or clean_title ilike '%Hoth%' or raw_title ilike '%Bespin%' or clean_title ilike '%Bespin%' then 'Star Wars: The Empire Strikes Back'
    else set_name
  end,
  pop_style = case
    when upc = '889698149570' then '3-Pack'
    else pop_style
  end,
  exclusivity = case
    when upc = '889698149570' then 'Walmart'
    else exclusivity
  end,
  display_description = null,
  api_last_updated = now()
where franchise = 'Star Wars'
  and (
    set_name in (
      'Star Wars', 'Wal-Mart', 'Stranger Things', 'Art Series. Star Wars', 'Art Series. Star Wars.',
      'Funko Special Edition, Star Wars', 'Impressions. Star Wars', 'Macy''s Thanksgiving Parade. The Mandalorian',
      'Mandalorian', 'Retro', 'Solo A Star Wars Story', 'Star Star Wars: The Force Awakens',
      'Star Wars. Celebration 2015', 'Star Wars. Galactic Convention', 'Star Wars. Special Edition'
    )
    or pop_name ilike '%Concept Series%'
    or pop_name ilike '%Red Saber Series%'
    or pop_name ilike '%Power Of The Galaxy%'
    or pop_name ilike '%Holiday%'
    or pop_name ilike '%Infinities%'
    or raw_title ilike '%Rise Of Skywalker%'
    or clean_title ilike '%Rise Of Skywalker%'
  );

update public.pop_catalog
set
  set_name = 'Star Wars: The Force Awakens',
  image_url = null,
  image_source = null,
  image_last_checked = now(),
  display_description = 'From Star Wars: The Force Awakens, Rey is a Pop! Star Wars release #114, Metallic.',
  api_last_updated = now()
where upc = '889698430210';

update public.pop_catalog
set display_description =
  trim(
    regexp_replace(
      concat(
        'From ', set_name, ', ', coalesce(nullif(pop_name, ''), nullif(character, ''), 'This Pop'),
        ' is a ',
        case
          when pop_style is not null and btrim(pop_style) <> '' and pop_style !~* '^(standard|common|pop)$'
            then concat(pop_style, ' ')
          else ''
        end,
        coalesce(nullif(pop_type, ''), 'Funko Pop'),
        ' release',
        case when number is not null and btrim(number) <> '' then concat(' #', number) else '' end,
        case when variant is not null and btrim(variant) <> '' and variant !~* '^common$' then concat(', ', variant) else '' end,
        case when exclusivity is not null and btrim(exclusivity) <> '' then concat(', ', exclusivity, ' exclusive') else '' end,
        '.'
      ),
      '\s+',
      ' ',
      'g'
    )
  )
where franchise = 'Star Wars'
  and display_description is null;
