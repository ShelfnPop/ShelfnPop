update public.pop_catalog
set estimated_value = 8.75
where upc = '889698573702';

update public.user_collection_items
set current_value = case
  when owned_variant ilike 'Chase' then 12.70
  when owned_variant ilike 'Common' then 8.75
  else current_value
end
where pop_catalog_id in (
  select id
  from public.pop_catalog
  where upc = '889698573702'
);
