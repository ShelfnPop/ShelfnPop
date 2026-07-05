create or replace function public.create_manual_out_of_box_item(
  pop_name_input text,
  franchise_input text default null,
  set_name_input text default null,
  number_input text default null,
  variant_input text default 'Common',
  estimated_value_input numeric default null,
  notes_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  catalog_id uuid;
  collection_id uuid;
  clean_name text := nullif(trim(pop_name_input), '');
  clean_franchise text := nullif(trim(franchise_input), '');
  clean_set text := nullif(trim(set_name_input), '');
  clean_number text := nullif(trim(number_input), '');
  clean_variant text := coalesce(nullif(trim(variant_input), ''), 'Common');
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if clean_name is null then
    raise exception 'Pop name is required';
  end if;

  insert into public.pop_catalog (
    upc,
    pop_name,
    character,
    franchise,
    set_name,
    number,
    variant,
    estimated_value,
    api_source,
    raw_title,
    clean_title,
    display_description,
    needs_review,
    raw_api_json
  ) values (
    null,
    clean_name,
    clean_name,
    clean_franchise,
    clean_set,
    clean_number,
    clean_variant,
    estimated_value_input,
    'manual_out_of_box',
    clean_name,
    clean_name,
    concat(clean_name, ' was added manually as an out-of-box shelf item.'),
    true,
    jsonb_build_object('source', 'manual_out_of_box', 'created_by', current_user_id)
  )
  returning id into catalog_id;

  insert into public.user_collection_items (
    user_id,
    pop_catalog_id,
    quantity,
    condition,
    owned_variant,
    current_value,
    purchase_price,
    notes
  ) values (
    current_user_id,
    catalog_id,
    1,
    'Out of Box',
    clean_variant,
    estimated_value_input,
    0,
    nullif(trim(notes_input), '')
  )
  returning id into collection_id;

  return collection_id;
end;
$$;

revoke all on function public.create_manual_out_of_box_item(text, text, text, text, text, numeric, text) from public, anon;
grant execute on function public.create_manual_out_of_box_item(text, text, text, text, text, numeric, text) to authenticated;
