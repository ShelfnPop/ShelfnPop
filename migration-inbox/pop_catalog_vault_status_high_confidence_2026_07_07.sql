-- High-confidence vaulted apply batch, staged 2026-07-07.
-- Scope: rows from the first 100 vault candidates with official Funko From the Vault evidence.
-- Evidence rule: exact character + box number + license/set match on Funko's From the Vault pages.
-- This file is apply-ready but has not been applied.

update public.pop_catalog
set vault_status = 'Vaulted'
where vault_status = 'Active'
  and id in (
    '507d423b-a2f4-456e-bb76-b8fcf71964bd', -- Robin #02, DC Comics. Official Funko From the Vault: https://funko.com/robin/2232.html
    '136d12fb-3834-46bd-acaa-dcf393321f54', -- Aquaman #16, DC Comics. Official Funko From the Vault: https://funko.com/pop-aquaman-dc-universe/2363.html
    '6a5063b6-6213-4576-950d-be6fab364991', -- Stitch #12, Lilo & Stitch. Official Funko From the Vault: https://funko.com/pop-stitch/2353.html
    'cc485373-0394-4530-85a5-2244b120aa48', -- Darth Vader #1, Star Wars. Official Funko From the Vault: https://funko.com/pop-darth-vader-with-red-lightsaber/2300.html
    'dae3d560-11de-4448-8f3e-b57deb35400d', -- Deadpool #20, Marvel/Deadpool. Official Funko From the Vault: https://funko.com/pop-deadpool/3052.html
    '73ec0253-924b-46ba-8914-3cdeb3cc60ba', -- Daenerys Targaryen #3, Game of Thrones. Official Funko From the Vault: https://funko.com/pop-daenerys-targaryen-with-red-dragon/3012.html
    '6aea367b-9d12-426c-8900-f280bb0b88e7'  -- Arya Stark #9, Game of Thrones. Official Funko From the Vault: https://funko.com/pop-arya-stark/3089.html
  );

-- Verification after applying:
-- select id, pop_name, set_name, number, vault_status
-- from public.pop_catalog
-- where id in (
--   '507d423b-a2f4-456e-bb76-b8fcf71964bd',
--   '136d12fb-3834-46bd-acaa-dcf393321f54',
--   '6a5063b6-6213-4576-950d-be6fab364991',
--   'cc485373-0394-4530-85a5-2244b120aa48',
--   'dae3d560-11de-4448-8f3e-b57deb35400d',
--   '73ec0253-924b-46ba-8914-3cdeb3cc60ba',
--   '6aea367b-9d12-426c-8900-f280bb0b88e7'
-- )
-- order by set_name, nullif(regexp_replace(coalesce(number,''), '\D', '', 'g'), '')::int nulls last;
