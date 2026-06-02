# Proposal: Transaction Date

## Summary

Add a read-only transaction date field to the expense form and display the date in the expense list. Preserve the transaction date already extracted during OFX import.

## Motivation

Users currently have no way to see on which day a specific expense occurred — only the month grouping is visible. This makes it hard to reconcile the app against bank statements or understand spending patterns within a month. The OFX import already parses transaction dates, but that data is discarded when saving.

## Scope

- Add `date` field to the expense data model.
- Show today's date (read-only) in the add-expense form.
- Show the existing date (read-only) in the edit-expense form.
- Display the date in a new column in the expense list.
- Preserve the transaction date from OFX imports (already parsed, currently lost on save).
- Update backup export/import to include the `date` field.

## Out of Scope

- User-editable dates.
- Date-based filtering, search, or grouping beyond month.
- Changing the month based on the transaction date (month selection remains manual).

## Decisions

- The date field SHALL be read-only in both add and edit modes to keep the UI simple and avoid date-validation complexity.
- Adding an expense SHALL use the current calendar date as the default.
- Editing an expense SHALL preserve the original date.
- OFX-imported expenses SHALL use the transaction date from the statement.
- The date SHALL be stored as `YYYY-MM-DD`.
