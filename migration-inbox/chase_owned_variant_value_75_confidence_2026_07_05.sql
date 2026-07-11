update public.user_collection_items
set current_value = case id
  when '05d0714e-de1f-4a49-9809-e43311cbd1ea' then 10.84
  when '798c4294-b684-419b-9f36-6d45ed29e55f' then 29.99
  when 'ff6dd14b-4915-4707-9404-6e5467736dfe' then 25.00
  when 'b5ce5013-1327-49d2-9f64-9fdc8754d24e' then 13.00
  else current_value
end
where id in (
  '05d0714e-de1f-4a49-9809-e43311cbd1ea',
  '798c4294-b684-419b-9f36-6d45ed29e55f',
  'ff6dd14b-4915-4707-9404-6e5467736dfe',
  'b5ce5013-1327-49d2-9f64-9fdc8754d24e'
);
