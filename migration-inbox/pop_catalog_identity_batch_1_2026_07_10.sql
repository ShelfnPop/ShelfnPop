-- Applied catalog identity cleanup, batch 1, 2026-07-10.
-- Keeps reviewed UPC identities stable through catalog_parser_overrides.

begin;

with reviewed(upc, override_data, notes) as (
  values
    ('889698609302', jsonb_build_object('pop_name','Jackie Robinson (Sliding)','character','Jackie Robinson','franchise','MLB','set_name','MLB: Brooklyn Dodgers','number','42','variant','Sliding','exclusivity','Exclusive','pop_type','Pop! Sports Legends','pop_style','Standard','description','Jackie Robinson (Sliding) is an MLB: Brooklyn Dodgers Pop! Sports Legends release #42, exclusive.','display_description','Jackie Robinson (Sliding) is an MLB: Brooklyn Dodgers Pop! Sports Legends release #42, exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified sliding exclusive identity.'),
    ('889698477550', jsonb_build_object('pop_name','Hattie','character','Hattie','franchise','Fast & Furious','set_name','Hobbs And Shaw','number','923','pop_type','Pop! Movies','pop_style','Standard','description','Hattie is a Fast & Furious: Hobbs And Shaw Pop! Movies release #923.','display_description','Hattie is a Fast & Furious: Hobbs And Shaw Pop! Movies release #923.','parse_confidence',0.98,'needs_review',false), 'Filled missing franchise from verified UPC identity.'),
    ('889698835398', jsonb_build_object('pop_name','Dexter Morgan','character','Dexter Morgan','franchise','Dexter','set_name','Dexter','number','1965','pop_type','Pop! Television','pop_style','Standard','description','Dexter Morgan is a Dexter Pop! Television release #1965.','display_description','Dexter Morgan is a Dexter Pop! Television release #1965.','parse_confidence',0.98,'needs_review',false), 'Filled missing Dexter franchise.'),
    ('889698322270', jsonb_build_object('pop_name','Bud Bundy','character','Bud Bundy','franchise','Married With Children','set_name','Married With Children','number','691','pop_type','Pop! Television','pop_style','Standard','description','Bud Bundy is a Married With Children Pop! Television release #691.','display_description','Bud Bundy is a Married With Children Pop! Television release #691.','parse_confidence',0.98,'needs_review',false), 'Filled missing Married With Children franchise.'),
    ('889698835381', jsonb_build_object('pop_name','Debra Morgan','character','Debra Morgan','franchise','Dexter','set_name','Dexter','number','1696','pop_type','Pop! Television','pop_style','Standard','description','Debra Morgan is a Dexter Pop! Television release #1696.','display_description','Debra Morgan is a Dexter Pop! Television release #1696.','parse_confidence',0.98,'needs_review',false), 'Filled missing Dexter franchise.'),
    ('889698568128', jsonb_build_object('pop_name','Mike Tyson','character','Mike Tyson','franchise','Boxing','set_name','Mike Tyson','number','1','pop_type','Pop! Boxing','pop_style','Standard','description','Mike Tyson is a Boxing Pop! release #1.','display_description','Mike Tyson is a Boxing Pop! release #1.','parse_confidence',0.98,'needs_review',false), 'Filled missing boxing identity and Pop line.'),
    ('889698674720', jsonb_build_object('pop_name','Joe Montana','character','Joe Montana','franchise','NFL','set_name','NFL: San Francisco 49ers','number','216','pop_type','Pop! Sports','pop_style','Standard','description','Joe Montana is an NFL: San Francisco 49ers Pop! Sports release #216.','display_description','Joe Montana is an NFL: San Francisco 49ers Pop! Sports release #216.','parse_confidence',0.98,'needs_review',false), 'Filled missing NFL identity and corrected set.'),
    ('889698724401', jsonb_build_object('pop_name','Xerxes','character','Xerxes','franchise','300','set_name','300 Movie','number','1475','pop_type','Pop! Movies','pop_style','Standard','description','Xerxes is a 300 Movie Pop! Movies release #1475.','display_description','Xerxes is a 300 Movie Pop! Movies release #1475.','parse_confidence',0.98,'needs_review',false), 'Filled missing 300 franchise.'),
    ('889698233439', jsonb_build_object('pop_name','Lobster Johnson','character','Lobster Johnson','franchise','Hellboy','set_name','Hellboy','number','4','pop_type','Pop! Comics','pop_style','Standard','description','Lobster Johnson is a Hellboy Pop! Comics release #4.','display_description','Lobster Johnson is a Hellboy Pop! Comics release #4.','parse_confidence',0.98,'needs_review',false), 'Filled missing Hellboy franchise and Pop line.'),
    ('849803096854', jsonb_build_object('pop_name','White Canary','character','White Canary','franchise','DC','set_name','DC''s Legends of Tomorrow','number','380','pop_type','Pop! Heroes','pop_style','Standard','description','White Canary is a DC''s Legends of Tomorrow Pop! Heroes release #380.','display_description','White Canary is a DC''s Legends of Tomorrow Pop! Heroes release #380.','parse_confidence',0.98,'needs_review',false), 'Corrected false Marvel classification.'),
    ('889698862776', jsonb_build_object('pop_name','Stitch with Tube','character','Stitch','franchise','Disney','set_name','Lilo & Stitch','number','1565','pop_type','Pop! Disney','pop_style','Standard','description','Stitch with Tube is a Disney Lilo & Stitch Pop! release #1565.','display_description','Stitch with Tube is a Disney Lilo & Stitch Pop! release #1565.','parse_confidence',0.98,'needs_review',false), 'Corrected truncated name, wrong set, and missing number.'),
    ('889698691215', jsonb_build_object('pop_name','Eugene','character','Eugene','franchise','DC','set_name','Shazam! Fury of the Gods','number','1281','pop_type','Pop! Movies','pop_style','Standard','description','Eugene is a DC Shazam! Fury of the Gods Pop! Movies release #1281.','display_description','Eugene is a DC Shazam! Fury of the Gods Pop! Movies release #1281.','parse_confidence',0.98,'needs_review',false), 'Corrected false Marvel classification.'),
    ('849803038267', jsonb_build_object('pop_name','Linus van Pelt','character','Linus van Pelt','franchise','Peanuts','set_name','Peanuts','number','50','pop_type','Pop! Animation','pop_style','Standard','description','Linus van Pelt is a Peanuts Pop! Animation release #50.','display_description','Linus van Pelt is a Peanuts Pop! Animation release #50.','parse_confidence',0.98,'needs_review',false), 'Corrected false Marvel and Walking Dead classification.'),
    ('889698712910', jsonb_build_object('pop_name','Indiana Jones','character','Indiana Jones','franchise','Indiana Jones','set_name','Raiders of the Lost Ark','number','8','exclusivity','Funko Shop','pop_type','Pop! Die-Cast','pop_style','Die-Cast','description','Indiana Jones is a Raiders of the Lost Ark Pop! Die-Cast release #8, Funko Shop exclusive.','display_description','Indiana Jones is a Raiders of the Lost Ark Pop! Die-Cast release #8, Funko Shop exclusive.','parse_confidence',0.98,'needs_review',false), 'Corrected franchise and Die-Cast product style.'),
    ('889698871877', jsonb_build_object('pop_name','Bullseye as Superman','character','Bullseye','franchise','Target','set_name','Ad Icons','number','249','variant','Superman','exclusivity','Target','pop_type','Pop! Ad Icons','pop_style','Standard','vault_status','Vaulted','description','Bullseye as Superman is a Target Ad Icons release #249, Target exclusive.','display_description','Bullseye as Superman is a Target Ad Icons release #249, Target exclusive.','parse_confidence',0.98,'needs_review',false), 'Reapplied verified Target Ad Icons identity after API drift.')
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
      vault_status = case when r.override_data ? 'vault_status' then r.override_data->>'vault_status' else p.vault_status end,
      description = r.override_data->>'description',
      display_description = r.override_data->>'display_description',
      parse_confidence = 0.98,
      parse_reason_codes = '{}'::text[],
      needs_review = false,
      api_last_updated = now()
  from reviewed r
  where p.upc = r.upc
  returning p.upc, p.id
)
insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
select r.upc, u.id, r.override_data, r.notes, true
from reviewed r
join updated_catalog u using (upc)
on conflict (upc) do update
set pop_catalog_id = excluded.pop_catalog_id,
    override_data = excluded.override_data,
    notes = excluded.notes,
    is_active = true,
    updated_at = now();

commit;
