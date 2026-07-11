-- Applied Standard-style missing-number cleanup, 2026-07-10.
-- Fifteen source-confirmed identifiers and four specialty-style corrections.

begin;

with reviewed(upc, override_data, notes) as (
  values
    ('889698830478', jsonb_build_object('pop_name','Pennywise Mug','character','Pennywise','franchise','IT','set_name','IT','number',null,'variant',null,'pop_type','Pop! Mug','pop_style','Mug','description','Pennywise is an IT 16 oz Pop! Mug.','display_description','Pennywise is an IT 16 oz Pop! Mug.','parse_confidence',0.98,'needs_review',false), 'Corrected specialty mug classification; legitimately unnumbered.'),
    ('889698918107', jsonb_build_object('pop_name','Premium Spider-Man','character','Spider-Man','franchise','Marvel','set_name','Spider-Man','number','1570','variant',null,'exclusivity','Target','pop_type','Pop! Premium','pop_style','Premium','description','Premium Spider-Man is a Marvel Pop! Premium release #1570, Target exclusive.','display_description','Premium Spider-Man is a Marvel Pop! Premium release #1570, Target exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified Target product identity and box number.'),
    ('889698251518', jsonb_build_object('pop_name','D*ck in a Box','character','D*ck in a Box','franchise','Saturday Night Live','set_name','Saturday Night Live','number',null,'variant',null,'pop_type','Pop! SNL','pop_style','2-Pack','description','D*ck in a Box is a Saturday Night Live Pop! 2-Pack.','display_description','D*ck in a Box is a Saturday Night Live Pop! 2-Pack.','parse_confidence',0.98,'needs_review',false), 'Corrected 2-Pack classification; legitimately unnumbered.'),
    ('889698913959', jsonb_build_object('pop_name','Wolverine Arcade','character','Wolverine','franchise','Marvel','set_name','X-Men','number',null,'variant',null,'pop_type','Bitty Pop! Arcade','pop_style','Bitty Pop Arcade','description','Wolverine Arcade is a Marvel X-Men Bitty Pop! Arcade release.','display_description','Wolverine Arcade is a Marvel X-Men Bitty Pop! Arcade release.','parse_confidence',0.98,'needs_review',false), 'Corrected Bitty Pop Arcade identity; legitimately unnumbered.'),
    ('889698837903', jsonb_build_object('pop_name','Peggy Carter','character','Peggy Carter','franchise','Marvel','set_name','The Infinity Saga','number','1475','variant',null,'pop_type','Pop! Marvel','pop_style','Standard','description','Peggy Carter is a Marvel The Infinity Saga Pop! release #1475.','display_description','Peggy Carter is a Marvel The Infinity Saga Pop! release #1475.','parse_confidence',0.98,'needs_review',false), 'Verified box number and cleared false Other variant.'),
    ('889698247474', jsonb_build_object('pop_name','Superman Silhouette','character','Superman','franchise','DC','set_name','Justice League','number','07','variant','Glow in the Dark','exclusivity','Entertainment Earth','pop_type','Pop! Heroes','pop_style','Standard','description','Superman Silhouette is a DC Justice League Pop! Heroes release #07, Glow in the Dark and Entertainment Earth exclusive.','display_description','Superman Silhouette is a DC Justice League Pop! Heroes release #07, Glow in the Dark and Entertainment Earth exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified box number, glow variant, and retailer.'),
    ('0889698346986', jsonb_build_object('pop_name','The Batman Who Laughs','character','The Batman Who Laughs','franchise','DC','set_name','DC Super Heroes','number','256','variant',null,'exclusivity','Previews','pop_type','Pop! Heroes','pop_style','Standard','description','The Batman Who Laughs is a DC Super Heroes Pop! Heroes release #256, Previews exclusive.','display_description','The Batman Who Laughs is a DC Super Heroes Pop! Heroes release #256, Previews exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified original Previews exclusive #256 identity.'),
    ('889698147460', jsonb_build_object('pop_name','BB-8','character','BB-8','franchise','Star Wars','set_name','Star Wars: The Last Jedi','number','196','variant',null,'pop_type','Pop! Star Wars','pop_style','Standard','description','BB-8 is a Star Wars: The Last Jedi Pop! Star Wars release #196.','display_description','BB-8 is a Star Wars: The Last Jedi Pop! Star Wars release #196.','parse_confidence',0.98,'needs_review',false), 'Verified The Last Jedi #196 identity.'),
    ('889698807869', jsonb_build_object('pop_name','Bagheera with Basket','character','Bagheera','franchise','Disney','set_name','The Jungle Book','number','1475','variant',null,'pop_type','Pop! Disney','pop_style','Standard','description','Bagheera with Basket is a Disney The Jungle Book Pop! release #1475.','display_description','Bagheera with Basket is a Disney The Jungle Book Pop! release #1475.','parse_confidence',0.98,'needs_review',false), 'Verified box number.'),
    ('889698891844', jsonb_build_object('pop_name','Freddy Funko as Orange Lantern','character','Freddy Funko','franchise','Funko','set_name','Fundays','number','SE','variant','Orange Lantern','pop_type','Pop! Freddy Funko','pop_style','Standard','limited_edition',true,'limited_count',3100,'edition_notes','Production run 3,100','description','Freddy Funko as Orange Lantern is a Fundays Pop! release #SE limited to 3,100 pieces.','display_description','Freddy Funko as Orange Lantern is a Fundays Pop! release #SE limited to 3,100 pieces.','parse_confidence',0.98,'needs_review',false), 'Verified SE identifier and 3,100-piece Fundays identity.'),
    ('889698467698', jsonb_build_object('pop_name','Gambit with Cards','character','Gambit','franchise','Marvel','set_name','X-Men','number','553','variant',null,'pop_type','Pop! Marvel','pop_style','Standard','description','Gambit with Cards is a Marvel X-Men Pop! release #553.','display_description','Gambit with Cards is a Marvel X-Men Pop! release #553.','parse_confidence',0.98,'needs_review',false), 'Verified box number.'),
    ('889698497930', jsonb_build_object('pop_name','Witchy Minnie','character','Minnie Mouse','franchise','Disney','set_name','Disney Halloween','number','796','variant','Witch','pop_type','Pop! Disney','pop_style','Standard','description','Witchy Minnie is a Disney Halloween Pop! release #796.','display_description','Witchy Minnie is a Disney Halloween Pop! release #796.','parse_confidence',0.98,'needs_review',false), 'Verified box number and resolved low-confidence review.'),
    ('889698614634', jsonb_build_object('pop_name','John Cena vs. The Rock (2012)','character','John Cena and The Rock','franchise','WWE','set_name','WWE','number',null,'variant',null,'pop_type','Pop! Moments','pop_style','Moment','description','John Cena vs. The Rock (2012) is an unnumbered WWE Pop! Moment.','display_description','John Cena vs. The Rock (2012) is an unnumbered WWE Pop! Moment.','parse_confidence',0.98,'needs_review',false), 'Corrected Pop Moment classification; legitimately unnumbered.'),
    ('889698602488', jsonb_build_object('pop_name','Spider-Man 2211','character','Spider-Man 2211','franchise','Marvel','set_name','Year of the Spider','number','979','variant',null,'exclusivity','Amazon','pop_type','Pop! Marvel','pop_style','Standard','description','Spider-Man 2211 is a Marvel Year of the Spider Pop! release #979, Amazon exclusive.','display_description','Spider-Man 2211 is a Marvel Year of the Spider Pop! release #979, Amazon exclusive.','parse_confidence',0.98,'needs_review',false), 'Separated character year from verified box number.'),
    ('889698774369', jsonb_build_object('pop_name','Ultimate Wolverine with Adamantium','character','Wolverine','franchise','Marvel','set_name','Wolverine 50th Anniversary','number','1372','variant',null,'pop_type','Pop! Marvel','pop_style','Standard','description','Ultimate Wolverine with Adamantium is a Marvel Wolverine 50th Anniversary Pop! release #1372.','display_description','Ultimate Wolverine with Adamantium is a Marvel Wolverine 50th Anniversary Pop! release #1372.','parse_confidence',0.98,'needs_review',false), 'Verified box number and specific set.'),
    ('889698881210', jsonb_build_object('pop_name','Brainiac','character','Brainiac','franchise','DC','set_name','Superman: Ghosts of Krypton','number','574','variant','Metallic','exclusivity','New York Comic Con','pop_type','Pop! Heroes','pop_style','Standard','description','Brainiac is a DC Superman: Ghosts of Krypton Pop! Heroes release #574, Metallic New York Comic Con exclusive.','display_description','Brainiac is a DC Superman: Ghosts of Krypton Pop! Heroes release #574, Metallic New York Comic Con exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified box number and convention identity.'),
    ('889698872492', jsonb_build_object('pop_name','Daredevil Unmasked','character','Daredevil','franchise','Marvel','set_name','Daredevil: Born Again','number','1547','variant','Unmasked','exclusivity','Entertainment Earth','pop_type','Pop! Television','pop_style','Standard','description','Daredevil Unmasked is a Marvel Daredevil: Born Again Pop! Television release #1547, Entertainment Earth exclusive.','display_description','Daredevil Unmasked is a Marvel Daredevil: Born Again Pop! Television release #1547, Entertainment Earth exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified box number and cleaned exclusive identity.'),
    ('889698810319', jsonb_build_object('pop_name','Dr. Nina Mazursky','character','Dr. Nina Mazursky','franchise','DC','set_name','Creature Commandos','number','1479','variant',null,'pop_type','Pop! Television','pop_style','Standard','description','Dr. Nina Mazursky is a DC Creature Commandos Pop! Television release #1479.','display_description','Dr. Nina Mazursky is a DC Creature Commandos Pop! Television release #1479.','parse_confidence',0.98,'needs_review',false), 'Verified box number and Television product line.'),
    ('889698862271', jsonb_build_object('pop_name','Superman Retro Comic (Flying)','character','Superman','franchise','DC','set_name','Kingdom Come','number','573','variant','Flying','exclusivity','New York Comic Con','pop_type','Pop! Heroes','pop_style','Standard','description','Superman Retro Comic (Flying) is a DC Kingdom Come Pop! Heroes release #573, New York Comic Con exclusive.','display_description','Superman Retro Comic (Flying) is a DC Kingdom Come Pop! Heroes release #573, New York Comic Con exclusive.','parse_confidence',0.98,'needs_review',false), 'Verified box number and specific Kingdom Come set.')
), updated_catalog as (
  update public.pop_catalog p
  set pop_name = r.override_data->>'pop_name',
      character = r.override_data->>'character',
      franchise = r.override_data->>'franchise',
      set_name = r.override_data->>'set_name',
      number = r.override_data->>'number',
      variant = r.override_data->>'variant',
      exclusivity = case when r.override_data ? 'exclusivity' then r.override_data->>'exclusivity' else p.exclusivity end,
      pop_type = r.override_data->>'pop_type',
      pop_style = r.override_data->>'pop_style',
      limited_edition = case when r.override_data ? 'limited_edition' then (r.override_data->>'limited_edition')::boolean else p.limited_edition end,
      limited_count = case when r.override_data ? 'limited_count' then (r.override_data->>'limited_count')::integer else p.limited_count end,
      edition_notes = case when r.override_data ? 'edition_notes' then r.override_data->>'edition_notes' else p.edition_notes end,
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
