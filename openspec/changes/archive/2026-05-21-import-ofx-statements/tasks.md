# Tasks

## Specification

- [x] Review and approve OFX import scope.
- [x] Decide review UI placement.
- [x] Decide how positive transactions appear in review.
- [x] Decide initial category keyword rules.
- [x] Decide whether to preserve original OFX metadata.
- [x] Decide whether positive transactions can be revealed in the first version.
- [x] Decide whether OFX metadata appears in the normal expense UI.

## Implementation

- [x] Add OFX file input/action to the main actions area.
- [x] Parse OFX text locally in the browser.
- [x] Extract transaction id, date, amount, description, and memo when present.
- [x] Normalize transaction dates into monthly expense references.
- [x] Convert negative transaction values into positive expense values.
- [x] Suggest categories from transaction descriptions.
- [x] Render a full-page import review section before saving.
- [x] Allow selecting/deselecting import rows.
- [x] Allow editing imported expense name, category, and value before saving.
- [x] Deduplicate imports using OFX transaction id when available.
- [x] Preserve original OFX metadata on imported expenses.
- [x] Save accepted rows as normal expenses.
- [x] Show feedback for successful import, skipped rows, and invalid files.

## Verification

- [x] Test a valid OFX file with multiple expense transactions.
- [x] Test an OFX file containing positive transactions.
- [x] Test duplicate import of the same OFX file.
- [x] Test malformed or unsupported OFX content.
- [x] Test imported expenses in monthly total, category summary, edit flow, removal flow, and `.gastos.json` export.
- [x] Test mobile layout for the review UI.
