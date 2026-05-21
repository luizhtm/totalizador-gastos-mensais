# Tasks

## Specification

- [ ] Review and approve OFX import scope.
- [x] Decide review UI placement.
- [x] Decide how positive transactions appear in review.
- [x] Decide initial category keyword rules.
- [x] Decide whether to preserve original OFX metadata.
- [x] Decide whether positive transactions can be revealed in the first version.
- [x] Decide whether OFX metadata appears in the normal expense UI.

## Implementation

- [ ] Add OFX file input/action to the main actions area.
- [ ] Parse OFX text locally in the browser.
- [ ] Extract transaction id, date, amount, description, and memo when present.
- [ ] Normalize transaction dates into monthly expense references.
- [ ] Convert negative transaction values into positive expense values.
- [ ] Suggest categories from transaction descriptions.
- [ ] Render a full-page import review section before saving.
- [ ] Allow selecting/deselecting import rows.
- [ ] Allow editing imported expense name, category, and value before saving.
- [ ] Deduplicate imports using OFX transaction id when available.
- [ ] Preserve original OFX metadata on imported expenses.
- [ ] Save accepted rows as normal expenses.
- [ ] Show feedback for successful import, skipped rows, and invalid files.

## Verification

- [ ] Test a valid OFX file with multiple expense transactions.
- [ ] Test an OFX file containing positive transactions.
- [ ] Test duplicate import of the same OFX file.
- [ ] Test malformed or unsupported OFX content.
- [ ] Test imported expenses in monthly total, category summary, edit flow, removal flow, and `.gastos.json` export.
- [ ] Test mobile layout for the review UI.
