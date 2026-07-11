-- Catalog cleanup for Justice League set separation.
-- Applied directly to Supabase on 2026-07-06 and kept here as an audit note.

with set_updates(upc, set_name) as (
  values
    ('889698344210','Justice League (2017)'),
    ('889698148672','Justice League (2017)'),
    ('889698137133','Justice League (2017)'),
    ('889698147415','Justice League (2017)'),
    ('889698134859','Justice League (2017)'),
    ('889698134866','Justice League (2017)'),
    ('889698137089','Justice League (2017)'),
    ('889698134880','Justice League (2017)'),
    ('889698354547','Justice League (2017)'),
    ('889698354714','Justice League (2017)'),
    ('889698323314','Justice League (2017)'),
    ('889698134873','Justice League (2017)'),
    ('889698137065','Justice League (2017)'),
    ('889698148696','Justice League (2017)'),
    ('889698148702','Justice League (2017)'),
    ('889698137072','Justice League (2017)'),
    ('889698137034','Justice League (2017)'),
    ('889698212953','Justice League (2017)'),
    ('889698666152','Justice League Comics'),
    ('889698666169','Justice League Comics'),
    ('889698666183','Justice League Comics'),
    ('889698666190','Justice League Comics'),
    ('889698666206','Justice League Comics'),
    ('889698904377','Justice League Dark'),
    ('889698904391','Justice League Dark'),
    ('889698568005','Zack Snyder''s Justice League'),
    ('889698567992','Zack Snyder''s Justice League'),
    ('889698573597','Zack Snyder''s Justice League'),
    ('889698581660','Zack Snyder''s Justice League'),
    ('889698568012','Zack Snyder''s Justice League'),
    ('889698567985','Zack Snyder''s Justice League'),
    ('889698568357','Zack Snyder''s Justice League'),
    ('0889698346986','The Batman Who Laughs')
)
update public.pop_catalog pc
set set_name = su.set_name
from set_updates su
where pc.upc = su.upc;

update public.pop_catalog set pop_name = 'Batman', character = 'Batman' where upc = '889698666152';
update public.pop_catalog set pop_name = 'Martian Manhunter', character = 'Martian Manhunter' where upc = '889698666190';
update public.pop_catalog set pop_name = 'Superman Landing', character = 'Superman', number = '1127' where upc = '889698568357';
update public.pop_catalog set pop_name = 'Swamp Thing', character = 'Swamp Thing', number = '624', pop_style = 'Jumbo' where upc = '889698904391';
update public.pop_catalog set number = '616', pop_style = 'Deluxe' where upc = '889698904377';
update public.pop_catalog set pop_name = 'Darkseid (Black & White)', character = 'Darkseid', variant = 'Black & White' where upc = '889698581660';
update public.pop_catalog set pop_name = 'The Batman Who Laughs', character = 'The Batman Who Laughs' where upc = '0889698346986';
update public.pop_catalog set pop_name = 'Batman + Aquaman 2-Pack', character = 'Batman + Aquaman', pop_style = '2-Pack' where upc = '889698212953';
update public.pop_catalog set pop_style = '2-Pack' where upc = '889698344210';
update public.pop_catalog
set pop_name = 'The Batman Who Laughs', character = 'The Batman Who Laughs'
where set_name = 'The Batman Who Laughs'
  and (pop_name ilike '%Batman Who Laughs%' or character ilike '%Batman Who Laughs%' or character is null);
