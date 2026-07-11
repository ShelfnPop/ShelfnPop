-- Normalize Funko variants to app-supported finish/chase labels.
-- Official Funko glossary base: Chase, Flocked, Diamond Collection/Glitter,
-- Glow in the Dark, Metallic, D.I.Y., Chrome, Blacklight, Artist Series.
-- App also supports common real-world combinations such as Glow in the Dark Chase.

update public.pop_catalog
set exclusivity = case
    when nullif(btrim(exclusivity), '') is not null then exclusivity
    when variant in ('Convention') then 'Convention'
    when variant in ('SDCC', 'SDCC / Summer Convention', 'SDCC Running') then 'San Diego Comic-Con'
    when variant in ('NYCC', 'Festival Of Fun NYCC') then 'New York Comic Con'
    when variant = 'ECCC' then 'Emerald City Comic Con'
    when variant = 'Spring Convention' then 'Spring Convention'
    when variant in ('Hot Topic') then 'Hot Topic'
    when variant in ('Target', 'Target Con Exclusive', 'Target Translucent') then 'Target'
    when variant = 'Funko Exclusive' then 'Funko'
    when variant = 'First To Market' then 'First To Market'
    when variant = 'First To Market D23' then 'D23'
    when variant = 'Toy Sapiens' then 'Toy Sapiens'
    else exclusivity
  end
where variant in (
  'Convention', 'SDCC', 'SDCC / Summer Convention', 'SDCC Running', 'NYCC',
  'Festival Of Fun NYCC', 'ECCC', 'Spring Convention', 'Hot Topic', 'Target',
  'Target Con Exclusive', 'Target Translucent', 'Funko Exclusive',
  'First To Market', 'First To Market D23', 'Toy Sapiens'
);

update public.pop_catalog
set variant = case
    when upc in ('830395022017', '849803074982') then 'Metallic Chase'
    when upc = '889698607094' then 'Glow in the Dark Chase'
    when variant in ('Glow', 'Glows In The Dark') then 'Glow in the Dark'
    when variant in ('Diamond', 'Diamond Collection', 'Diamond DC Shop') then 'Diamond Collection'
    when variant in ('Black White', 'Black Out') then 'Black & White'
    when variant in ('Green Chrome', 'Black Chrome', 'Blue Chrome', 'Gold Chrome', 'Orange Chrome', 'Helmet Chrome') then 'Chrome'
    when variant in ('Invisible', 'Target Translucent') then 'Translucent'
    when variant in ('Convention', 'SDCC', 'SDCC / Summer Convention', 'SDCC Running', 'NYCC',
      'Festival Of Fun NYCC', 'ECCC', 'Spring Convention', 'Hot Topic', 'Target',
      'Target Con Exclusive', 'Funko Exclusive', 'First To Market', 'First To Market D23',
      'Toy Sapiens', 'Special Edition', 'Digital', 'Movie Moments', 'Flying', 'Beskar Armor',
      'Mandalorian Armor', 'Masked', 'Mountain Gear', 'Pickett', 'Random', 'Ravagers Pot',
      'With Gift', 'With Pin', 'X-Force', 'X-Men', 'General', 'Iron') then null
    when variant in ('Blue', 'Gold', 'Black', 'Electrocuted', 'FEAR', 'Futura Camo',
      'Pride', 'Rainbow', 'Red', 'Silver', 'Soft Color', 'Supernova') then 'Other'
    else variant
  end
where nullif(btrim(variant), '') is not null;

update public.user_collection_items u
set owned_variant = case
    when pc.upc in ('830395022017', '849803074982') then 'Metallic Chase'
    when pc.upc = '889698607094' then 'Glow in the Dark Chase'
    when pc.upc = '889698515351' and u.owned_variant = 'Chase' then 'Diamond Collection Chase'
    when u.owned_variant in ('Glow', 'Glows In The Dark', 'GitD') then 'Glow in the Dark'
    when u.owned_variant in ('Diamond', 'Diamond Collection', 'Diamond DC Shop') then 'Diamond Collection'
    when u.owned_variant in ('Black White', 'Black Out') then 'Black & White'
    when u.owned_variant in ('Green Chrome', 'Black Chrome', 'Blue Chrome', 'Gold Chrome', 'Orange Chrome', 'Helmet Chrome') then 'Chrome'
    when u.owned_variant in ('Invisible', 'Target Translucent') then 'Translucent'
    when u.owned_variant in ('Convention', 'SDCC', 'SDCC / Summer Convention', 'SDCC Running', 'NYCC',
      'Festival Of Fun NYCC', 'ECCC', 'Spring Convention', 'Hot Topic', 'Target',
      'Target Con Exclusive', 'Funko Exclusive', 'First To Market', 'First To Market D23',
      'Toy Sapiens', 'Special Edition', 'Digital', 'Movie Moments', 'Flying', 'Beskar Armor',
      'Mandalorian Armor', 'Masked', 'Mountain Gear', 'Pickett', 'Random', 'Ravagers Pot',
      'With Gift', 'With Pin', 'X-Force', 'X-Men', 'General', 'Iron', 'None') then 'Common'
    when u.owned_variant in ('Blue', 'Gold', 'Black', 'Electrocuted', 'FEAR', 'Futura Camo',
      'Pride', 'Rainbow', 'Red', 'Silver', 'Soft Color', 'Supernova') then 'Other'
    else u.owned_variant
  end
from public.pop_catalog pc
where pc.id = u.pop_catalog_id
  and nullif(btrim(u.owned_variant), '') is not null;
