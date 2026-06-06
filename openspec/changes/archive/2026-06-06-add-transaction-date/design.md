# Design: Transaction Date

## Data Model

Add an optional `date` field (`YYYY-MM-DD`) to the expense object:

- Manual expenses: set to today's date at creation.
- OFX-imported expenses: set to the transaction date already parsed from the OFX file.
- Legacy expenses (without `date`): display `—` in the list and omit from the form.

## Normalization

Update `normalizeStoredExpense` and `normalizeImportedExpense` in `app-core.js` to pass through the `date` field. Validate format as `YYYY-MM-DD`; discard invalid values.

## Form (`index.html`)

Add an `<input type="date" disabled>` below the existing fields:

```
label: Data
input: type="date", disabled
```

In add mode: `value` = today.
In edit mode: `value` = expense.date (or empty `—` if not set for legacy data).

## List (`app.js` — `renderExpenseTable`)

Insert a new `<td>` between the selection cell and the item cell showing the formatted date (`dd/mm/aaaa`). Update `colspan` of the empty-state row from `5` to `6`.

## OFX Import (`app.js` — `confirmOfxImport`)

Copy `draft.date` into the saved expense object. The OFX draft already contains the parsed date from `createOfxDrafts`.

## Backup

Include `date` in the backup payload. Bump `BACKUP_VERSION` if a breaking format change is needed (not required if field is optional).

## Sort

Add `date` as a sortable field alongside name, category, and value. Sorting by date uses chronological order (ascending = oldest first). Tie-breaking follows existing behavior (item ascending as secondary ordering).
