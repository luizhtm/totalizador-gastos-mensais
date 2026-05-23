# Proposal: Sort Expense List

## Summary

Allow users to sort the monthly expense list by item, category, or value.

## Motivation

Imported OFX files can create many expense rows at once. Sorting the list makes it easier to review expenses, compare categories, and find high-value items without changing saved data.

## Scope

- Add sorting controls for item, category, and value.
- Preserve the current initial ordering by item ascending.
- Show the active sort field and direction.
- Keep sorting scoped to the selected month.
- Do not persist sort preference between sessions.

## Out of Scope

- Filtering and search.
- Multi-column sorting beyond a deterministic tie-breaker.
- Persisting the selected sort order.
