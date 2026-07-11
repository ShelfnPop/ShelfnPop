# Correction: Shaun Of The Dead chase ownership

Date: 2026-07-08

## Finding

Shaun (Pool Cue) #1660 has two owned collection items on one shared catalog row:

- `owned_variant = Common`
- `owned_variant = Chase`

## Correction

The Shaun (Pool Cue) (Bloody) (Chase) checklist row should count as owned. It is linked to the shared Shaun (Pool Cue) #1660 catalog row, with the ownership evidence coming from `user_collection_items.owned_variant = Chase`.

## Expected result

- Shaun Of The Dead should verify as 4 required rows, 4 linked rows.
