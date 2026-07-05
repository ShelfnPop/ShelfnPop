-- Clear low-quality, non-English, or marketplace descriptions already saved in pop_catalog.
-- Future scans/refreshes are handled by the updated cleanDescription() in lookup_pop_6_28.ts.

update public.pop_catalog
set
  description = null,
  api_last_updated = now()
where description is not null
  and (
    description ~* '\mdécouvrez\M'
    or description ~* '\mcomparez\M'
    or description ~* 'avant de l[''’]acheter'
    or description ~* '\mréf\.?\M'
    or description ~* '\mfigurine funko\M'
    or description ~* '\mfigura\M'
    or description ~* '\mvinilo\M'
    or description ~* '\mvinyle\M'
    or description ~* '\mcolecci[oó]n\M'
    or description ~* '\mpersonaje\M'
    or description ~* '\mproducto\M'
    or description ~* 'distribuidor autorizado'
    or description ~* '\menv[ií]os\M'
    or description ~* '\mpulgadas\M'
    or description ~* 'hecho de'
    or description ~* '\mempaque\M'
    or description ~* 'estoy viviendo'
    or description ~* 'de la exitosa serie'
    or description ~* '\mdescubre\M'
    or description ~* 'compare prices'
    or description ~* 'across[[:space:]]+[0-9]+\+?[[:space:]]+retailers'
    or description ~* 'from[[:space:]]+\$[0-9]'
    or description ~* 'pop vinyl figures take characters from pop culture'
  );

-- A few exact bad matches seen in the parser review export.
update public.pop_catalog
set
  description = null,
  api_last_updated = now()
where upc in (
  '849803050580',
  '849803071714',
  '830395030180',
  '849803045920',
  '889698880954',
  '889698674461',
  '889698160049',
  '889698520614',
  '849803060534',
  '889698691932',
  '889698885560',
  '889698866194',
  '889698757492'
);
