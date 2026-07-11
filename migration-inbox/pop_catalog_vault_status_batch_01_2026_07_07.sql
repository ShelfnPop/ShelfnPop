-- Vault status review batch 01, staged 2026-07-07.
-- Scope: 50 currently Active catalog rows with older Funko UPC families and 2010-2014 release dates.
-- Evidence level: medium unless separately rechecked against an official Funko listing.
-- Rationale: these are older/discontinued lines with marketplace/catalog evidence frequently identifying them as vaulted.
-- Review sources sampled during batch setup:
-- - PriceCharting/eBay result snippets for Robin #2, Green Lantern #9, Aquaman #16, Batman #41, Tyrion Lannister #1, Agent Coulson #53.
-- - Funko Wiki/Fandom line lists for Game of Thrones release-year identity checks.
-- This file is intentionally staged in migration-inbox and has not been applied.

update public.pop_catalog
set vault_status = 'Vaulted'
where vault_status = 'Active'
  and id in (
    '507d423b-a2f4-456e-bb76-b8fcf71964bd', -- Robin, DC Universe #2, UPC 830395022093, 2010
    '32050ca1-8870-4921-a801-ab6a62f57fd4', -- Joker, DC Universe #6 Black & White, UPC 849803076139, 2010
    'e4659656-9bc2-42d0-a8c7-640ebe1bb42b', -- Green Lantern, DC Universe #9, UPC 830395021782, 2010
    'a35e0215-ca58-49ec-9994-16aedd78ed81', -- Superman, Superman #7 Black & White, UPC 849803076122, 2010
    'b725d3cf-7f19-451b-9d42-4e22faac64f4', -- Superman, Superman #7 Metallic, UPC 830395022505, 2010
    '136d12fb-3834-46bd-acaa-dcf393321f54', -- Aquaman, DC Universe #16, UPC 830395035192, 2011
    '6a5063b6-6213-4576-950d-be6fab364991', -- Stitch, Lilo & Stitch #12, UPC 830395023533, 2011
    '50934a02-880f-4e64-9460-c0f8410c1b05', -- Wolverine, Marvel Universe: Series 1 #5, UPC 830395022772, 2011
    '848952ad-0795-4e24-88bd-7f44b4d28ef4', -- Mickey Mouse, Mickey Mouse #1 Metallic, UPC 830395023427, 2011
    'd5efa18e-7de8-4745-865e-22d9f248cd27', -- Minnie Mouse, Mickey Mouse #23, UPC 830395024769, 2011
    'cc485373-0394-4530-85a5-2244b120aa48', -- Darth Vader, Star Wars #1, UPC 830395023007, 2011
    '87246ea6-541a-4362-8979-3b7d359d4b97', -- Yoda, Star Wars #02 Glow in the Dark, UPC 849803055400, 2011
    'af7825b3-d25e-40de-abc9-d9d09357d44b', -- The Black Flash, DC Universe #22, UPC 830395030180, 2012
    '0d0d8bb9-8393-4edd-a6d4-6ea9077468e2', -- Silver Surfer, Marvel Universe: Series 2 #19, UPC 830395030517, 2012
    'dae3d560-11de-4448-8f3e-b57deb35400d', -- Deadpool, Marvel Universe: Series 2 #20, UPC 830395030524, 2012
    'fe4e95f7-a7e9-47a2-82d3-6dd5c2ae5e34', -- X-Men Deadpool, Marvel Universe: Series 2 #20, UPC 849803049188, 2012
    'd112ab61-55fd-4b2a-ac74-317b775ae921', -- Batman, Batman Classic TV Series #41, UPC 830395031163, 2013
    'd2fbbaff-5c5e-4d9d-aef1-270cac971e1c', -- Robin, Batman Classic TV Series #42, UPC 830395031170, 2013
    'd3004114-8775-46b4-9fd8-a0df3c288ddf', -- Catwoman, Batman Classic TV Series #43, UPC 830395031194, 2013
    '8c6b2cc3-5ed7-4a85-9a31-5ad12c0df800', -- The Joker, Batman Classic TV Series #44, UPC 830395031200, 2013
    '33e2dc1e-1eb6-441c-b42d-d5ab0b22ddc3', -- Harley Quinn With Mallet, DC Comics #45, UPC 849803036386, 2013
    '03472700-866c-4dca-aa81-fade02be4e3f', -- Batman Unmasked, DC Super Heroes #51, UPC 849803044824, 2013
    '522096c5-95d8-413c-a92a-540797daf70b', -- Agnes, Despicable Me 2 #34, UPC 830395033686, 2013
    'c30abb35-0ecf-4299-baef-4dcce7133a2c', -- Tyrion Lannister, Game of Thrones #1, UPC 830395030142, 2013
    'e00b7e06-09d6-44a8-b742-e52ca7a98e57', -- Ned Stark, Game of Thrones #2, UPC 830395030166, 2013
    '73ec0253-924b-46ba-8914-3cdeb3cc60ba', -- Daenerys Targaryen, Game of Thrones #3, UPC 830395030128, 2013
    'd51fbd66-6940-4948-8605-60af957f2528', -- Khal Drogo, Game of Thrones #4, UPC 830395030135, 2013
    '3373e42d-6796-45b0-bcf0-3ed9d812eae5', -- The Hound, Game of Thrones #5, UPC 830395030159, 2013
    'e2af204c-c904-471f-959f-05d0687d8a71', -- White Walker, Game of Thrones #6, UPC 830395030173, 2013
    'ed6608a2-c9b9-46ec-b82b-5a94e3f08d47', -- Jon Snow, Game of Thrones #7, UPC 830395030906, 2013
    '6aea367b-9d12-426c-8900-f280bb0b88e7', -- Arya Stark, Game of Thrones #9, UPC 830395030890, 2013
    '236982af-f867-40e0-88e8-020e24b82a2e', -- Cersei Lannister, Game of Thrones #11, UPC 830395030876, 2013
    '53a68fa9-6b6a-466e-955b-1ee27eac3f5c', -- Superman, Man of Steel #29, UPC 830395030494, 2013
    '2a84bb04-7d8f-43ea-bf1b-0524eea6467a', -- General Zod, Man of Steel #30, UPC 830395030500, 2013
    '3ff104ff-4b8d-47d3-8081-7fbf9b5c84f5', -- Loki, Marvel Comics #36 Black & White, UPC 849803049164, 2013
    '8c3e2a7d-304c-4672-9ed9-46e74af44af0', -- Unmasked Deadpool, Marvel Universe: Series 3 #29, UPC 830395032603, 2013
    '39ef3b6b-a629-4f56-9666-8806965d08bc', -- Red Hulk, Marvel Universe: Series 3 #31, UPC 849803035389, 2013
    '14cad3a9-047d-4eed-98dd-7060399ef5f8', -- The Joker, The Dark Knight Trilogy #36, UPC 830395033723, 2013
    '333676fd-6852-4b62-9a41-85ce811d60ff', -- Agent Coulson, Agents Of S.H.I.E.L.D #53, UPC 849803040536, 2014
    '82b21b60-364b-4a60-9e73-c5101d53c69e', -- Ash, Army of Darkness #53, UPC 830395034072, 2014
    'd9cb7e64-0142-4ad8-9df2-3d764286a919', -- Earth 2 Batman, DC Super Heroes #62, UPC 849803046255, 2014
    '7106e6de-e7e9-41cc-a55e-57feb2c221e7', -- Olaf, Frozen #79 Glitter, UPC 849803049997, 2014
    '74adb98e-35fe-469c-a6c9-aeb83756121e', -- Brienne of Tarth, Game of Thrones #13, UPC 849803040178, 2014
    'ed1f4466-de81-40a6-ab5f-b3db32dc07af', -- Ghost, Game of Thrones #19, UPC 849803038762, 2014
    'e300505f-71bd-4121-9c27-47f1175b0eec', -- Tyrion Lannister (Battle Armor), Game of Thrones #21, UPC 849803037796, 2014
    '7e767be5-f4b0-4d9e-8ee5-5493897b1e77', -- Jon Snow (Castle Black), Game of Thrones #26, UPC 849803040734, 2014
    'a2039060-c983-40de-936d-32ca69b5b619', -- Samwell Tarly, Game of Thrones #27, UPC 849803040741, 2014
    '702c3117-062d-4d6e-a000-19aba135a0df', -- Sansa Stark, Game of Thrones #28, UPC 849803040758, 2014
    '1e0b2990-13ea-47cb-bdcf-6f4b070ca8bc', -- Star-Lord, Guardians of the Galaxy #47, UPC 849803037918, 2014
    'd8c4e039-0950-4074-9580-8f2c853ddf82'  -- Rocket Raccoon, Guardians of the Galaxy #48, UPC 849803037925, 2014
  );

-- Verification after applying:
-- select vault_status, count(*) from public.pop_catalog group by 1 order by 2 desc;
-- select id, upc, pop_name, set_name, number, vault_status
-- from public.pop_catalog
-- where id in (
--   '507d423b-a2f4-456e-bb76-b8fcf71964bd',
--   'd8c4e039-0950-4074-9580-8f2c853ddf82'
-- );
