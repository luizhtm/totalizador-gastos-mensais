# Proposal: Bulk Expense Actions

## Summary

Allow users to select multiple expenses in the monthly list and apply bulk actions to the selected items.

## Motivation

OFX imports can create many expense rows at once. Reviewing each row individually is slow when several items need the same category adjustment or when multiple rows should be removed. Bulk selection keeps the manual workflow available while making imported statement cleanup much faster.

## Scope

- Add multi-selection to the selected month's expense list.
- Show the number of selected expenses while selection is active.
- Provide an easy control in the selection column to select all expenses in the selected month and clear the current selection.
- Show a sticky bulk action bar at the bottom of the expense list card while expenses are selected so bulk actions remain reachable during scrolling.
- Allow bulk category editing for selected expenses.
- Allow bulk removal for selected expenses after explicit confirmation.
- Remove the dedicated `Limpar mês` button from the `Itens cadastrados` header.
- Clear selection when the selected month changes, when expenses are imported, or when the list becomes empty.
- Update summaries, category totals, and the expense list after bulk actions.

## Out of Scope

- Bulk editing item names, descriptions, values, or dates.
- Selecting expenses across multiple months.
- Persisting selection between sessions or page reloads.
- Undo history after bulk changes.
- Advanced filters or search.

## Decisions

- Bulk edit SHALL only change category for the selected expenses and require confirmation before applying.
- Bulk removal SHALL require confirmation before deleting selected expenses.
- Bulk action controls SHALL live in a dedicated action bar at the bottom of the expense list card.
- The sticky action bar behavior SHALL activate only while there is at least one selected expense.
- Mobile layouts SHALL surface the select/deselect all control inside the bulk action bar while selection is active.
- Clearing the whole month SHALL be done by selecting all monthly expenses and using bulk removal.
- Individual edit and remove actions SHALL remain available when no expenses are selected.
- Individual edit and remove actions SHALL remain visible but disabled while selection is active to keep row layout stable.
- Disabled individual actions SHALL explain that the user must clear the selection before editing or removing a single expense.
