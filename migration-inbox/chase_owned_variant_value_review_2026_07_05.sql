update public.user_collection_items
set current_value = case id
  when '616e5882-56dc-4ace-94f4-f7515a56eb9e' then 7.03
  when 'b336532d-7830-4e10-884c-f6a2b7f26db2' then 21.39
  when '5b4cd6d9-3bd7-4e22-8a7c-c06c3eabf5d1' then 42.00
  when '6067c0a0-13fd-411d-94c7-cd0619bc7ead' then 29.97
  when '0f5b61a5-0fb7-4573-87b1-a1ea7b09ac59' then 6.94
  when 'b4579588-4592-409d-ae7e-dd9acb39211a' then 23.97
  when '99659ee6-ec96-4676-86d6-1ae1be0ece02' then 16.97
  else current_value
end
where id in (
  '616e5882-56dc-4ace-94f4-f7515a56eb9e',
  'b336532d-7830-4e10-884c-f6a2b7f26db2',
  '5b4cd6d9-3bd7-4e22-8a7c-c06c3eabf5d1',
  '6067c0a0-13fd-411d-94c7-cd0619bc7ead',
  '0f5b61a5-0fb7-4573-87b1-a1ea7b09ac59',
  'b4579588-4592-409d-ae7e-dd9acb39211a',
  '99659ee6-ec96-4676-86d6-1ae1be0ece02'
);
