begin;

update public.pop_catalog
set raw_title = 'Deadpool with Candy Canes #400',
    clean_title = 'Deadpool with Candy Canes #400',
    pop_name = 'Deadpool with Candy Canes',
    character = 'Deadpool',
    franchise = 'Marvel',
    set_name = 'Marvel Holiday',
    number = '400',
    variant = 'Common',
    exclusivity = null,
    estimated_value = 7.97,
    description = 'Deadpool with Candy Canes is a Marvel Funko Pop #400 from Marvel Holiday.',
    display_description = 'Deadpool with Candy Canes is a Marvel Funko Pop #400 from Marvel Holiday.',
    api_source = 'go-upc+manual_pricecharting_correction',
    image_source = coalesce(image_source, 'go-upc'),
    edition_notes = concat_ws('; ', nullif(edition_notes, ''), 'Corrected from Robin Hood #1440 UPC collision; PriceCharting Deadpool #400 value checked 2026-07-05'),
    parse_confidence = 0.98,
    needs_review = false,
    api_last_updated = now()
where upc = '889698339858';

update public.user_collection_items uci
set current_value = 7.97
from public.pop_catalog pc
where uci.pop_catalog_id = pc.id
  and pc.upc = '889698339858';

commit;
