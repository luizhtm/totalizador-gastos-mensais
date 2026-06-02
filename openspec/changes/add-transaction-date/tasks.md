# Tasks: Transaction Date

## Implementation

- [x] Add `date` field to expense data model in `app-core.js` (`normalizeStoredExpense`, `normalizeImportedExpense`).
- [x] Add read-only date field to expense form in `index.html`.
- [x] Set today's date when opening the add-expense modal.
- [x] Set the existing date when opening the edit-expense modal.
- [x] Include `date` in `readFormExpense()` and `handleFormSubmit()`.
- [x] Add date column to `renderExpenseTable()` in `app.js`.
- [x] Preserve `draft.date` in `confirmOfxImport()`.
- [x] Handle legacy expenses without a date field gracefully (show `—`).
- [x] Add `date` as a sortable field in `sortExpenses()` in `app-core.js`.
- [x] Add `Data` option to the sort field select in `index.html`.

## Verification

- [x] Update or add unit tests in `app-core.test.js` for date normalization.
- [x] Verify add-expense form shows today's date (read-only).
- [x] Verify edit-expense form shows the saved date (read-only).
- [x] Verify date column appears in the expense list.
- [x] Verify OFX import preserves the transaction date.
- [x] Verify backup export/import round-trips the date field.
- [x] Verify sorting by date works in ascending and descending order.
- [x] Verify expenses without a date appear last when sorting by date.
