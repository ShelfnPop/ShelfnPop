-- Shelf-n-Pop catalog health follow-up: final missing-franchise one-offs.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Thirty-three exact UPCs remaining from the 2026-07-13 weekly health check
--   where franchise was null after clustered cleanup.
--
-- Safety:
--   Exact UPC list only. No deletes. No value/image/UPC changes. Upserts active
--   catalog_parser_overrides so lookup_pop keeps the reviewed identity.

with reviewed(
  upc, pop_name, character, franchise, set_name, set_total, number, variant,
  exclusivity, pop_type, pop_style, notes
) as (
  values
    ('889698724371','Dilios','Dilios','300','300',6,'1472',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; 300 Dilios #1472.'),
    ('889698501002','Jimmy Garoppolo','Jimmy Garoppolo','NFL','San Francisco 49ers',null,'141',null,null,'Pop! Football','Standard','2026-07-13 final missing-franchise one-off; NFL San Francisco 49ers Jimmy Garoppolo #141.'),
    ('889698656443','Miles Quaritch','Miles Quaritch','Avatar','Avatar',null,'1324',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Avatar Miles Quaritch #1324.'),
    ('889698730884','Neytiri','Neytiri','Avatar','Avatar: The Way of Water',null,'1550',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Avatar: The Way of Water Neytiri #1550.'),
    ('889698386838','Orioles Mascot','Orioles Mascot','MLB','Baltimore Orioles',null,'10',null,null,'Pop! MLB','Standard','2026-07-13 final missing-franchise one-off; MLB Baltimore Orioles Mascot #10.'),
    ('889698400985','Black Lightning','Black Lightning','DC','Black Lightning',null,'344',null,null,'Pop! Heroes','Standard','2026-07-13 final missing-franchise one-off; DC Black Lightning #344.'),
    ('889698485180','Brandon Breyer','Brandon Breyer','Brightburn','Brightburn',null,'1129',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Brightburn Brandon Breyer #1129.'),
    ('889698725606','Wheeler','Wheeler','Captain Planet','Captain Planet',9,'1328',null,null,'Pop! Animation','Standard','2026-07-13 final missing-franchise one-off; Captain Planet Wheeler #1328.'),
    ('889698426497','Chuck Noland','Chuck Noland','Cast Away','Cast Away',2,'792',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Cast Away Chuck Noland #792.'),
    ('889698839105','Travis Kelce','Travis Kelce','NFL','Kansas City Chiefs',null,'298',null,null,'Pop! Football','Standard','2026-07-13 final missing-franchise one-off; NFL Kansas City Chiefs Travis Kelce #298.'),
    ('889698724425','Dante','Dante','Clerks III','Clerks III',6,'1482',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Clerks III Dante #1482.'),
    ('889698837224','Lady of Pain','Lady of Pain','Dungeons & Dragons','Dungeons & Dragons',null,'1037',null,null,'Pop! Games','Standard','2026-07-13 final missing-franchise one-off; Dungeons & Dragons Lady of Pain #1037.'),
    ('889698680844','Forge','Forge','Dungeons & Dragons','Dungeons & Dragons: Honor Among Thieves',null,'1330',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Dungeons & Dragons Honor Among Thieves Forge #1330.'),
    ('889698492737','Kenny Powers','Kenny Powers','Eastbound & Down','Eastbound & Down',null,'1079',null,null,'Pop! Television','Standard','2026-07-13 final missing-franchise one-off; Eastbound & Down Kenny Powers #1079.'),
    ('849803096601','Ferris Bueller','Ferris Bueller','Ferris Bueller''s Day Off','Ferris Bueller''s Day Off',null,'317',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Ferris Bueller #317.'),
    ('889698742672','Chris Washington with Deer','Chris Washington','Get Out','Get Out',3,'1859','With Deer',null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Get Out Chris Washington with Deer #1859.'),
    ('830395022888','Gremlin','Gremlin','Gremlins','Gremlins',null,'6',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Gremlins Gremlin #6.'),
    ('889698724340','Max','Max','Mad Max','Mad Max: The Road Warrior',null,'1469',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Mad Max: The Road Warrior Max #1469.'),
    ('889698453998','Ricky Vaughn','Ricky Vaughn','Major League','Major League',null,'886','Wild Thing',null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Major League Ricky Wild Thing Vaughn #886.'),
    ('889698732864','OJ Haywood','OJ Haywood','Nope','Nope',1,'1433',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Nope OJ Haywood #1433.'),
    ('889698528870','Wienermobile','Wienermobile','Oscar Mayer','Oscar Mayer',null,'97',null,null,'Pop! Ad Icons','Standard','2026-07-13 final missing-franchise one-off; Oscar Mayer Wienermobile #97.'),
    ('889698844260','Sabretooth','Sabretooth','Marvel','The Astonishing X-Men: Age of Apocalypse',null,'63','Comic Cover','Amazon','Pop! Comic Covers','Comic Cover','2026-07-13 final missing-franchise one-off; Marvel Astonishing X-Men Sabretooth comic cover #63.'),
    ('889698592529','Rocky Balboa','Rocky Balboa','Rocky','Rocky: 45th Anniversary',4,'1177',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Rocky 45th Anniversary Rocky Balboa #1177.'),
    ('889698559799','Marvin the Martian','Marvin the Martian','Space Jam','Space Jam: A New Legacy',null,'1085',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Space Jam Marvin the Martian #1085.'),
    ('889698567541','Michelangelo','Michelangelo','Teenage Mutant Ninja Turtles','Teenage Mutant Ninja Turtles',null,'1141',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Teenage Mutant Ninja Turtles Michelangelo #1141.'),
    ('889698723367','Michelangelo','Michelangelo','Teenage Mutant Ninja Turtles','Teenage Mutant Ninja Turtles: Mutant Mayhem',null,'1395',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; TMNT Mutant Mayhem Michelangelo #1395.'),
    ('889698811880','Petrie','Petrie','The Land Before Time','The Land Before Time',null,'1840',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; The Land Before Time Petrie #1840.'),
    ('889698576895','Beth Harmon','Beth Harmon','The Queen''s Gambit','The Queen''s Gambit',null,'1122',null,null,'Pop! Television','Standard','2026-07-13 final missing-franchise one-off; corrected bad The Suicide Squad set to The Queen''s Gambit Beth Harmon #1122.'),
    ('889698740616','Toxic Avenger','Toxic Avenger','The Toxic Avenger','The Toxic Avenger',null,'479','Glow in the Dark','New York Comic Con','Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; The Toxic Avenger NYCC glow #479.'),
    ('889698810098','Uncle Buck','Uncle Buck','Uncle Buck','Uncle Buck',null,'1670',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Uncle Buck #1670.'),
    ('889698443128','Red','Red','Us','Us',7,'836',null,null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Us Red #836.'),
    ('849803045555','Ragnar Lothbrok','Ragnar Lothbrok','Vikings','Vikings',null,'177',null,null,'Pop! Television','Standard','2026-07-13 final missing-franchise one-off; Vikings Ragnar Lothbrok #177.'),
    ('889698724197','Bugs Bunny as Buddy the Elf','Bugs Bunny','Warner Bros. 100th Anniversary','Warner Bros. 100th Anniversary',null,'1450','As Buddy the Elf',null,'Pop! Movies','Standard','2026-07-13 final missing-franchise one-off; Warner Bros. 100 Bugs Bunny as Buddy the Elf #1450.')
),
payload as (
  select
    *,
    jsonb_build_object(
      'pop_name', pop_name,
      'character', character,
      'franchise', franchise,
      'set_name', set_name,
      'set_total', set_total,
      'number', number,
      'variant', variant,
      'exclusivity', exclusivity,
      'pop_type', pop_type,
      'pop_style', pop_style,
      'description', pop_name || ' belongs to the ' || set_name || ' line as #' || number || '.',
      'display_description', pop_name || ' belongs to the ' || set_name || ' line as #' || number || '.',
      'parse_confidence', 0.98,
      'needs_review', false,
      'warnings', jsonb_build_array()
    ) as override_data
  from reviewed
),
updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = p.pop_name,
    character = p.character,
    franchise = p.franchise,
    set_name = p.set_name,
    set_total = coalesce(p.set_total, pc.set_total),
    number = p.number,
    variant = p.variant,
    exclusivity = p.exclusivity,
    pop_type = p.pop_type,
    pop_style = p.pop_style,
    description = p.override_data->>'description',
    display_description = p.override_data->>'display_description',
    parse_confidence = 0.98,
    needs_review = false,
    parse_reason_codes = '{}'::text[],
    api_last_updated = now()
  from payload p
  where pc.upc = p.upc
  returning pc.id, pc.upc
),
upserted_overrides as (
  insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
  select p.upc, u.id, p.override_data, p.notes, true
  from payload p
  join updated_catalog u using (upc)
  on conflict (upc) do update
  set pop_catalog_id = excluded.pop_catalog_id,
      override_data = excluded.override_data,
      notes = excluded.notes,
      is_active = true,
      updated_at = now()
  returning upc
)
select
  (select count(*) from updated_catalog) as catalog_rows_updated,
  (select count(*) from upserted_overrides) as active_overrides_upserted;

select
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.set_name,
  pc.set_total,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_type,
  pc.pop_style,
  pc.needs_review,
  pc.parse_reason_codes,
  cpo.is_active as parser_override_active,
  cpo.override_data->>'franchise' as override_franchise
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698724371','889698501002','889698656443','889698730884',
  '889698386838','889698400985','889698485180','889698725606',
  '889698426497','889698839105','889698724425','889698837224',
  '889698680844','889698492737','849803096601','889698742672',
  '830395022888','889698724340','889698453998','889698732864',
  '889698528870','889698844260','889698592529','889698559799',
  '889698567541','889698723367','889698811880','889698576895',
  '889698740616','889698810098','889698443128','849803045555',
  '889698724197'
)
order by pc.franchise, pc.number;
