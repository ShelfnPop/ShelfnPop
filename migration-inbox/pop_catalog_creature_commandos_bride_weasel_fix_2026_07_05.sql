begin;

update public.pop_catalog
set raw_title = 'Creature Commandos - The Bride #1478',
    clean_title = 'Creature Commandos - The Bride #1478',
    pop_name = 'The Bride',
    character = 'The Bride',
    franchise = 'DC',
    set_name = 'Creature Commandos',
    number = '1478',
    variant = 'Common',
    exclusivity = null,
    estimated_value = null,
    description = 'The Bride is a DC Funko Pop #1478 from Creature Commandos.',
    display_description = 'The Bride is a DC Funko Pop #1478 from Creature Commandos.',
    api_source = replace(coalesce(api_source, 'catalog'), '+pricecharting', ''),
    raw_api_json = case
      when jsonb_typeof(raw_api_json) = 'object' then raw_api_json - 'pricecharting'
      else raw_api_json
    end,
    parse_confidence = 0.98,
    needs_review = false,
    api_last_updated = now()
where upc = '889698810302';

update public.pop_catalog
set raw_title = 'Creature Commandos - Weasel #1482',
    clean_title = 'Creature Commandos - Weasel #1482',
    pop_name = 'Weasel',
    character = 'Weasel',
    franchise = 'DC',
    set_name = 'Creature Commandos',
    number = '1482',
    variant = 'Common',
    exclusivity = null,
    estimated_value = null,
    description = 'Weasel is a DC Funko Pop #1482 from Creature Commandos.',
    display_description = 'Weasel is a DC Funko Pop #1482 from Creature Commandos.',
    api_source = replace(coalesce(api_source, 'catalog'), '+pricecharting', ''),
    raw_api_json = case
      when jsonb_typeof(raw_api_json) = 'object' then raw_api_json - 'pricecharting'
      else raw_api_json
    end,
    parse_confidence = 0.98,
    needs_review = false,
    api_last_updated = now()
where upc = '889698810340';

update public.user_collection_items uci
set current_value = null
from public.pop_catalog pc
where uci.pop_catalog_id = pc.id
  and pc.upc in ('889698810302', '889698810340')
  and uci.current_value in (76.06, 53.28);

commit;
