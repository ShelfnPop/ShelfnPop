# Vault Status First 100 Confidence Review - 2026-07-07

Scope: first 100 staged vault candidates from `pop_catalog_vault_status_batch_01_2026_07_07.sql` and `pop_catalog_vault_status_batch_02_2026_07_07.sql`.

## High confidence - official Funko evidence

These rows have exact official Funko evidence matching the character, box number, and license/set context.

| Catalog ID | Pop | Catalog set | Evidence |
| --- | --- | --- | --- |
| 507d423b-a2f4-456e-bb76-b8fcf71964bd | Robin #2 | DC Universe | Official Funko page: Vaulted Product, Box Number 02, From the Vault, DC Comics |
| 136d12fb-3834-46bd-acaa-dcf393321f54 | Aquaman #16 | DC Universe | Official Funko page metadata: Vaulted Product, Box Number 16, From the Vault, DC Comics |
| 6a5063b6-6213-4576-950d-be6fab364991 | Stitch #12 | Lilo & Stitch | Official Funko page metadata: Box Number 12, From the Vault, Disney / Lilo & Stitch |
| cc485373-0394-4530-85a5-2244b120aa48 | Darth Vader #1 | Star Wars | Official Funko page metadata: Vaulted Product, Box Number 1, From the Vault, Star Wars |
| dae3d560-11de-4448-8f3e-b57deb35400d | Deadpool #20 | Marvel Universe: Series 2 | Official Funko page metadata: Vaulted Product, Box Number 20, From the Vault, Marvel / Deadpool |
| 73ec0253-924b-46ba-8914-3cdeb3cc60ba | Daenerys Targaryen #3 | Game of Thrones | Official Funko page: Vaulted Product, Box Number 3, From the Vault, HBO |
| 6aea367b-9d12-426c-8900-f280bb0b88e7 | Arya Stark #9 | Game of Thrones | Official Funko page metadata: Box Number 9, From the Vault |

Apply-ready file: `pop_catalog_vault_status_high_confidence_2026_07_07.sql`.

## Medium confidence - keep staged, needs another source

Most of the remaining candidates still look plausible because they are older, retired-era Pops and/or show marketplace or collector database evidence. Keep them in the staged batch files, but do not promote them to high confidence until one of these is found:

- Official Funko page/listing with vaulted status or From the Vault context.
- HobbyDB/PPG page with explicit vaulted status.
- Two independent reputable collector/retailer sources that agree on the exact character, box number, and variant.

Examples currently staying medium:

- Tyrion Lannister #1: marketplace and collector signals exist, but official Funko matches found were different Tyrion products.
- Harry Potter #1: marketplace/collector signals exist, but no exact official Funko vaulted page found yet.
- Drax #50: marketplace signals exist, but the official Funko vaulted Drax page found was box #200, not #50.
- Star-Lord #47: official vaulted Star-Lord page found was box #198, not #47.
- Yoda #2 Glow in the Dark: official Yoda #2 page exists, but the exact GITD/exclusive variant still needs confirmation.

## Recheck / likely false positive

| Catalog ID | Pop | Reason |
| --- | --- | --- |
| 50934a02-880f-4e64-9460-c0f8410c1b05 | Wolverine #5 | Official Funko result appears to be an active/current product page, so this should not be marked Vaulted from the first pass without stronger evidence. |

