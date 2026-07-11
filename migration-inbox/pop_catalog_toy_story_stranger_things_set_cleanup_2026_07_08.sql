-- Toy Story + Stranger Things set-name cleanup, 2026-07-08.
-- Scope: clean noisy set labels and split obvious Stranger Things / Toy Story buckets.

-- Toy Story cleanup.
update public.pop_catalog
set set_name = 'Toy Story 30th Anniversary'
where id = 'f0723d77-e545-444b-a4aa-a314491cc531'; -- Woody on Bullseye #1597

update public.pop_catalog
set set_name = 'Toy Story 5'
where id = 'e228fca5-d7df-4392-b53c-b659a7308f71'; -- Bullseye as Buzz Lightyear #1721

update public.pop_catalog
set set_name = 'Toy Story 5',
    number = coalesce(number, '1713')
where id = 'd8131835-ad0f-46e9-85b4-333424278271'; -- Bullseye, Toy Story 5 Premium/Flocked

-- Stranger Things: Season 1.
update public.pop_catalog
set set_name = 'Stranger Things: Season 1'
where id in (
  '60260525-d9fa-4b54-a09f-af9ab1d6ef36', -- Eleven Underwater #422
  'f2da99b2-8673-48e3-be4f-3eb00022ef16', -- Dustin #424
  '132fa58c-1f36-47e7-af8d-c487885d78c3', -- Lucas #425
  'd7a2367c-5934-468b-96fb-2c88b033ee8f', -- Barb #427
  'eb875a02-f4d4-4406-ae70-953cca20b3e8', -- Joyce with Lights #436
  'b1d9d5c1-9fcc-40ce-910e-9e2fa61a3e2b', -- Steve #475
  'abfed599-c325-4d52-93ae-e1b212a60717', -- Eleven in Hospital Gown #511
  'b64a3759-c62c-4dba-8d9c-227265949e72', -- Nancy #514
  '5b8600a7-866a-4257-9d12-838bd4617e35'  -- Eleven with Electrodes #523
);

-- Stranger Things: Season 2.
update public.pop_catalog
set set_name = 'Stranger Things: Season 2'
where id in (
  '486e52d3-e922-4d90-bfd4-47ccbcb8ab32', -- Ghostbuster Mike #546
  '5b624977-bb27-49d9-bd41-f182e9557eae', -- Ghostbuster Will #547
  'afe89345-8d67-4eb8-83fc-5a971add9bc7', -- Lucas Ghostbuster #548
  '1a8a0b06-4478-4989-a4bb-212ac2b1aa79', -- Ghostbuster Dustin #549
  'f2699954-44a9-4fa2-8e5e-ef6cb9aeebdf', -- S2 Joyce #550
  '0cd2b5a4-7d42-44fe-a2fd-65db6f8d81f9', -- Max Costume #552
  'afe22f74-4fed-478a-9392-962d6b8f20a6', -- Eleven Elevated #637
  '54ab7f83-a9cd-47ba-adf3-4964a8a29c1e', -- Steve with Sunglasses #638
  '14947d07-b5b6-46d3-876f-10cd96a427e9', -- Bob in Scrubs #639
  '7f61ba46-4c33-40fe-b7a8-78032b10ac6d', -- Steve with Bandana #642
  '900c05a0-ddfa-43c6-b94a-a5194008f2a3', -- Eleven Burger T-Shirt #718
  '73a0cf74-f019-4eb7-9b72-94a3d118f3dd', -- Dustin Hockey Gear #719
  'c239f4c8-ae89-424b-8bc8-424e1982a266'  -- Hopper #720
);

-- Stranger Things: Season 3.
update public.pop_catalog
set set_name = 'Stranger Things: Season 3'
where id in (
  'f3c156d1-66b6-4853-85af-a4d5bbb26969', -- Joyce #75
  '8616a485-51b6-4851-bf6a-acd9f0e89f05', -- Dustin Henderson #75 Hot Topic
  '152fb0e3-d598-491e-921c-c10eec47c35a', -- Eleven #802 GITD
  'b77e2a72-e743-4f26-861f-c493438d9a23', -- Steve #803
  '1b147025-f02b-4134-a917-8a8d8f86d5d1', -- Dustin at Camp #804
  'fe6aa08e-bf6e-45ad-9a9a-aaf306ebf799', -- Will the Wise #805
  '0c3bfbe7-ad66-49dc-b56d-3ff52a71b030', -- Max #806
  '42752276-abc1-4879-829f-56293eb905c0', -- Lucas #807
  'a6ce222c-ac64-458d-88cf-740441f6a1b7', -- Erica #808
  '00395d2f-1ad9-45e1-9617-88a2d88ef425', -- Battle Eleven #826
  '46340683-f579-4478-8686-c1abc657ea81', -- Flayed Billy #844
  'a5702071-04b4-4772-9043-440ad67ce376', -- Eleven #854
  '9bc95bf5-8f3a-43a7-8377-2f1475c626fe'  -- Alexei #923
);

-- Stranger Things: Season 4.
update public.pop_catalog
set set_name = 'Stranger Things: Season 4'
where id in (
  '67ce431f-905f-480c-8111-07267aa0edfb', -- Eleven #1238
  'a80f4f27-a7cb-4ac3-927d-e9332ef08bf3', -- Mike #1239
  'ec449fa9-9507-4206-8185-2e653ff779ba', -- Dustin #1240
  '778bdb9c-491e-4d14-84b4-f9e3f590962a', -- Lucas #1241
  'a1e12294-1464-465d-9d55-8f7d64e0e117', -- Will #1242
  '5d8ddf57-3767-4729-aa61-3e4cba6bdad2', -- Max #1243
  '5dc49f18-d278-4868-a744-d1e1dbaf6c83', -- Robin #1244
  '418552e7-cfb2-45a7-bfd5-02e20d25f798', -- Steve #1245
  'd95c30e0-4aa2-4f13-adb0-8995009605dc', -- Lucas in Jersey #1246
  '75ea82e3-a767-4155-a6ac-e92ac7dd3fc0', -- Eddie #1250
  'a95c6a72-c378-4bb6-b346-3b1d278c3419', -- Joyce #1253
  'ab93319a-11fc-4538-b1c3-d4b151fa40d7', -- Joyce #1254
  'ed2db4e7-7166-4bc0-bc2a-50350d897fac', -- Eleven #1297
  '795fcafa-eabc-4c91-ab6d-4680a2049841', -- Mike #1298
  '782144cb-98b7-49ab-97f9-bf976c7e85e4', -- Steve #1300
  '83abcf34-dcb0-455e-84f1-7f9e33380b36', -- Argyle #1302
  'fbc3cf43-2dab-4085-9858-ff7ee00f20c8', -- Demobat #1303
  '9421f88a-7758-4dd6-a43e-420f08508c2d', -- Number One #1387
  '0b29c02e-ff6e-430a-86a1-2242ea605fbc', -- Finale Eleven #1457
  '82fe8519-1a7b-409d-b8b8-978826b90316', -- Henry (001) #1458
  '56eb2a7e-426e-465b-8236-0e6ebe6152cd', -- Jonathan #1459
  'cacec53b-6582-49d7-95c9-db29e1ac938e', -- Nancy Wheeler with Shotgun #1460
  'a56c9c50-5e91-47a9-8660-73fb40c94763', -- Robin with Cocktail #1461
  'ce12e7e5-0a1d-44a1-a6d0-3f1bddb026de', -- Eddie #1462
  '9c33c502-0c89-428d-bb67-6ef4ecc3e7a0', -- Dustin with Shield #1463
  'b3680ccc-043e-4aaa-bb68-8f85002241ad', -- Mike with Will's Painting #1539
  'ad166430-9524-4d39-9055-ae9d62f60592', -- Vecna Mid-Transformation #1540
  'f6f70c12-793e-4cff-874d-500f9f8c768c', -- Demogorgon #1547
  '7fb02be0-06d0-4775-afbc-5ce6e07b368e'  -- 001 Vaporizing #1559
);

-- Stranger Things: Season 5.
update public.pop_catalog
set set_name = 'Stranger Things: Season 5'
where id in (
  '48668943-9d4c-4730-9261-c5705ac43948', -- Nancy Wheeler #1778
  '60fd8d1b-294c-4a4b-8f5a-31ec8347c601', -- Steve Harrington #1779
  '330e2101-1756-4e56-b58a-4fec32a456ad', -- Eleven #1780
  '16710a4a-6fc3-4287-b177-3b0a2749623c', -- Dustin Henderson #1781
  '46b04642-9ed1-4750-9e15-a1eea02cf652', -- Holly Wheeler #1782
  '6dfc49fd-d6ba-4305-b919-f7cbd5b0d75c', -- Mike Wheeler #1783
  'ff882fc0-8449-4ec5-835e-99ca63ec7191', -- Lucas Sinclair #1785
  '3cb6da22-5cc8-462f-8336-18ad6181a67b', -- Dustin with Flashlight #1796
  '19012d99-2b22-48fb-b248-4939ca733dac', -- Jonathan Byers #1797
  '2d995c57-abc0-4d81-85fd-1531944712d0', -- Lucas Sinclair #1798
  '61546046-9abb-4204-98ee-678f1167acd6', -- Robin with Flashlight #1799
  '831f1968-21e3-4902-99a4-4e7d4d18fca1', -- Nancy Wheeler with Shotgun #1802
  '2f573eef-8d81-46a5-8405-2572e7f0106c', -- Derek Turnbow #1803
  '6bc19f61-9920-48a0-9013-3dc7f57e3fee', -- Max Mayfield #1805
  'f42d0bc2-8654-433f-8d20-9bc83aadc37b', -- Vecna 2.0 #1806
  '619405a0-137e-4d79-80ed-90bf1412630a', -- Eleven in Wetsuit #1807
  'd1578612-f25c-4560-99d3-7f5f3bd767c5', -- Mr. Whatsit #1808
  '470f22de-1d1a-4c2f-82f1-a7ab19266f33', -- Will Byers #1809
  '16883ddb-2ec4-472f-951e-d37a7f51496a', -- Holly the Heroic #1810
  '500ceb34-6c52-43f3-8dc5-654c9e6db940', -- Erica Sinclair #1812
  'c979b65e-c978-49ba-9086-7234bc391bb4', -- Jim Hopper #1907
  '27a377d7-b4cb-4889-90e4-89805f283e96', -- Barb Holland Split #1908
  '8ddb8150-e2d6-4104-8d82-6ccb515c4653'  -- Will Byers #1909
);

-- Verification:
-- select set_name, count(*) as rows
-- from public.pop_catalog
-- where lower(coalesce(franchise,'')) like '%toy story%'
--    or lower(coalesce(set_name,'')) like '%toy story%'
--    or lower(coalesce(franchise,'')) like '%stranger things%'
--    or lower(coalesce(set_name,'')) like '%stranger things%'
-- group by set_name
-- order by set_name;
