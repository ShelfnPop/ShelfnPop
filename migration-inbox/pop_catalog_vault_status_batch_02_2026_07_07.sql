-- Vault status review batch 02, staged 2026-07-07.
-- Scope: next 50 currently Active catalog rows after batch 01, using release_date and older UPC families.
-- Evidence level: medium unless separately rechecked against an official Funko listing.
-- Rationale: older/discontinued 2010, 2014, and 2015 lines with marketplace/catalog evidence frequently identifying them as vaulted.
-- Review sources sampled during batch setup:
-- - PriceCharting/eBay result snippets for Black Canary #209 and Hawkeye #70.
-- - Figure Realm checklist for Arrow 2015 release identity.
-- - Harry Potter checklist/Funko Wiki for 2015 wave identity.
-- - Marketplace/catalog snippets for Guardians of the Galaxy Drax #50.
-- This file is intentionally staged in migration-inbox and has not been applied.

update public.pop_catalog
set vault_status = 'Vaulted'
where vault_status = 'Active'
  and id in (
    '7d8a376a-1817-4b85-a48c-b4060d1e61a1', -- Joker, DC Heroes/DC Super Heroes #6 Metallic, UPC 830395022116, released 2010-01-01
    '8605d115-549a-4286-966d-ffa8c2e88e1a', -- Drax, Guardians of the Galaxy #50, UPC 849803037949, released 2014-01-01
    'da54074a-437e-48b7-aabd-9be0d4a43e53', -- Gamora, Guardians of the Galaxy #51, UPC 849803037956, released 2014-01-01
    '025743e7-8873-4eba-91c2-162e8b775065', -- Dancing Groot, Guardians of the Galaxy #65, UPC 849803051044, released 2014-01-01
    '0807689d-474b-49dd-a315-10da048aa5cd', -- Professor X, Marvel Universe: Series 4 #57, UPC 849803044688, released 2014-01-01
    '961cba0d-a1ad-4ec4-9477-42a544143091', -- Greg Jenko, 21 Jump Street #174, UPC 849803053086, released 2015-01-01
    'ba2a5627-c788-461d-ac98-8b613a4bbfb9', -- Agent May, Agents Of S.H.I.E.L.D #88, UPC 849803051204, released 2015-01-01
    '605b471d-27bd-4743-851a-a6e143df0864', -- Ant-Man, Ant-Man #85, UPC 849803049638, released 2015-01-01
    '22889e93-77e1-4d26-a79a-0d27cb13fefa', -- Yellowjacket, Ant-Man #86, UPC 849803049621, released 2015-01-01
    '24103ff3-38e6-4da4-8cff-9169439d3d5a', -- The Arrow, Arrow #207, UPC 849803053468, released 2015-01-01
    'cf6ff166-b830-4959-9474-9d4744219337', -- Black Canary, Arrow #209, UPC 849803053420, released 2015-01-01
    '233934ea-5c51-4e27-9970-661ba88d814e', -- Deathstroke, Arrow #210, UPC 849803053437, released 2015-01-01
    '165d9d50-2681-4eb3-9032-1540a7be3cb1', -- Deathstroke: Unmasked, Arrow #211, UPC 849803055554, released 2015-01-01
    'dc35d5e0-599f-44f9-8d72-5f071c84396c', -- Hawkeye, Avengers: Age of Ultron #70, UPC 849803047818, released 2015-01-01
    '5dfc4e64-15db-49f4-9aa8-83226d6cb500', -- Ultron, Avengers: Age of Ultron #72, UPC 849803047757, released 2015-01-01
    'fa2110b3-2243-49ed-abbf-e87761c267d7', -- Grinning Ultron, Avengers: Age of Ultron #83, UPC 849803056063, released 2015-01-01
    '48cf8e87-2ea0-44c4-8684-400fd42cb160', -- Black Widow, Avengers: Age of Ultron #91, UPC 849803047931, released 2015-01-01
    '80c3a0e7-f5f4-43d7-9f34-96855e0201ab', -- Scarlet Witch, Avengers: Age of Ultron #95, UPC 849803047795, released 2015-01-01
    '259c79da-f847-4508-8265-c84c772a5787', -- Batman, Batman v Superman: Dawn of Justice #84, UPC 849803060251, released 2015-01-01
    '8709c6a8-1581-496b-9a09-0627f1fdb12b', -- Superman, Batman v Superman: Dawn of Justice #85, UPC 849803060268, released 2015-01-01
    '676ce797-7335-45c2-9c5c-7eb3082cc6d1', -- Wonder Woman, Batman v Superman: Dawn of Justice #86, UPC 849803060275, released 2015-01-01
    'ccb452bb-874c-496b-9f1b-03b2e77b6a7d', -- Aquaman (Underwater), Batman v Superman: Dawn of Justice #87, UPC 849803075767, released 2015-01-01
    '1181ff68-1ed6-4ab2-9312-028f1c1174dc', -- Knightmare Batman, Batman v Superman: Dawn of Justice #89, UPC 849803075781, released 2015-01-01
    '030b69c3-cd33-4372-86e0-f132adaa94d5', -- Superman Soldier, Batman v Superman: Dawn of Justice #90, UPC 849803075798, released 2015-01-01
    'e74db0cc-3b4c-4212-8620-b05fc18478b0', -- Black Widow, Black Widow #103, UPC 849803065089, released 2015-01-01
    '53afb05a-54ea-41b3-b3a2-1d746c46598e', -- Captain America, Captain America #67, UPC 849803047788, released 2015-01-01
    '809e0f94-f9d3-4aa3-86e8-9d13f498c655', -- Black Lantern Reverse Flash, DC Super Heroes #68, UPC 849803050580, released 2015-01-01
    'a9c2845f-065e-408f-833d-e37915da96d3', -- New 52 Reverse Flash, DC Super Heroes #81, UPC 849803071714, released 2015-01-01
    '21ef099d-8cbf-468c-8116-8584b5f3ee2c', -- Leela, Futurama #28, UPC 849803052362, released 2015-01-01
    '66efb215-7ba7-4296-a418-96b625333b19', -- Bender, Futurama #29, UPC 849803052348, released 2015-01-01
    '5e99404b-889d-4640-a806-44eb0459e7d7', -- Robot Devil, Futurama #30, UPC 849803052379, released 2015-01-01
    'f028deb4-df10-4445-9c7c-6f93566f166b', -- Cobra Commander, G.I. Joe #44, UPC 849803061364, released 2015-01-01
    '77ef1442-9051-47c8-b242-9b665c3c349a', -- Oberyn Martell, Game of Thrones #30, UPC 849803050719, released 2015-01-01
    '34c9e8bf-439c-4e86-b6ea-3177b1f25a41', -- The Mountain, Game of Thrones #31, UPC 849803050726, released 2015-01-01
    '22bdd135-8bf3-4465-8c7a-9adcd9ef8254', -- Grey Worm, Game of Thrones #32, UPC 849803050733, released 2015-01-01
    '1238b121-666c-475a-86f3-262b1a818ef4', -- Wight, Game of Thrones #33, UPC 849803050702, released 2015-01-01
    '749e75f6-c13d-44a7-9cde-f76320424754', -- Ramsay Bolton, Game of Thrones #37, UPC 849803064600, released 2015-01-01
    '57cf5d11-2267-4fbd-b808-c725e6218a9e', -- Iron Throne, Game of Thrones #38, UPC 849803063931, released 2015-01-01
    '3707e174-b186-4d7e-9737-4658f040d6c4', -- Harvey Bullock, Gotham #76, UPC 849803062477, released 2015-01-01
    '9be46e32-4e6a-4231-8d6e-381d90423484', -- Selina Kyle, Gotham #79, UPC 849803062507, released 2015-01-01
    '93c7e0cd-9909-4e7a-a3b3-efc64e8653b0', -- Fish Mooney, Gotham #80, UPC 849803062460, released 2015-01-01
    '31682c3a-6ab4-4539-be4d-af1ab8e4232d', -- Blackest Night Superman, Green Lantern #83 Gold, UPC 849803074739, released 2015-01-01
    '923a8e93-48ce-4859-8669-c0eb44d634de', -- Yondu, Guardians of the Galaxy #74, UPC 849803051754, released 2015-01-01
    '2980a73f-c627-4d45-9217-e18ebfd8127b', -- Ronan, Guardians of the Galaxy #75, UPC 849803051761, released 2015-01-01
    '615c4490-0ebe-4caf-9956-7315be0e88ba', -- Collector, Guardians of the Galaxy #77, UPC 849803051785, released 2015-01-01
    '07040a27-b77e-4363-8e72-f5889857a389', -- Thanos, Guardians of the Galaxy #78, UPC 849803051051, released 2015-01-01
    'de98a2ed-06d0-4f3a-91f3-a10bcdbdbeaa', -- Harry Potter, Harry Potter #1, UPC 849803058586, released 2015-01-01
    '4fc4dc71-2ca3-43a3-aa38-153018bd3f98', -- Hermione Granger, Harry Potter #3, UPC 849803058609, released 2015-01-01
    'ad795bd2-0951-45c5-a79d-d8847c203812', -- Severus Snape, Harry Potter #5, UPC 849803058623, released 2015-01-01
    'a6bbc9f1-e15a-4e57-852b-442289d0c7d6'  -- Lord Voldemort, Harry Potter #6, UPC 849803058616, released 2015-01-01
  );

-- Verification after applying:
-- select vault_status, count(*) from public.pop_catalog group by 1 order by 2 desc;
