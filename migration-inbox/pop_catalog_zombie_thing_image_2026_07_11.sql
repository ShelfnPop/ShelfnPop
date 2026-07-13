-- Fill the one currently missing catalog image with the official Funko Vault image.
-- Source: https://funko.com/pop-jumbo-zombie-the-thing/48901.html
-- Image:  https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw0791f051/images/funko/48901-1.png?sh=800&sw=800

update pop_catalog
set
  image_url = 'https://funko.com/dw/image/v2/BGTS_PRD/on/demandware.static/-/Sites-funko-master-catalog/default/dw0791f051/images/funko/48901-1.png?sh=800&sw=800',
  image_source = 'funko',
  image_last_checked = now()
where id = 'd269d353-a70f-4729-bec2-9ebd4a63de19'
  and upc = '889698489010';

select
  id,
  upc,
  pop_name,
  number,
  set_name,
  image_url,
  image_source,
  image_last_checked
from pop_catalog
where id = 'd269d353-a70f-4729-bec2-9ebd4a63de19';
