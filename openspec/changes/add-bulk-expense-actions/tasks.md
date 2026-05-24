# Tasks: Bulk Expense Actions

## Implementation

- [x] Add selection state scoped to the current month.
- [x] Add row selection controls plus a selection-column control for selecting or deselecting all monthly expenses.
- [x] Render selected count and bulk action controls in a dedicated action bar at the bottom of the expense list card.
- [x] Make the bulk action bar sticky only while selection is active.
- [x] Remove the dedicated `Limpar mês` button from the list header.
- [x] Implement bulk category editing for selected expenses.
- [x] Implement confirmed bulk removal for selected expenses.
- [x] Clear selection on month change, successful import, and after bulk actions.
- [x] Keep individual row edit/remove actions working independently of selection.
- [x] Disable individual row edit/remove actions while selection is active and explain why they are disabled.

## Verification

- [x] Add or update unit tests for bulk category updates and bulk removal logic.
- [x] Verify summaries and category totals update after bulk category edit.
- [x] Verify summaries and category totals update after bulk removal.
- [x] Verify selection does not persist after changing months.
- [x] Verify selecting all expenses and bulk removing them replaces the old clear-month flow.
- [x] Verify individual row actions are disabled only while selection is active.
- [ ] Verify sticky bulk action bar behavior on desktop and mobile widths.
