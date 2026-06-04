# Proposal: Month-to-Month Comparison

## Summary

Add a lightweight comparison view that shows expenses side by side across months, using a table with months as columns and categories as rows.

## Motivation

Users currently see only the selected month at a time. Switching months manually to compare spending is slow and error-prone. A dedicated comparison view makes it easy to spot trends, seasonal changes, and category drift across the year without leaving the app.

## Scope

- Add a CTA card (below the summary cards) to access the comparison, visible only when 2+ months have expenses.
- Show a table where each row is a fixed category and each column is a month with expenses.
- Display the total per category per month, plus a column total per month.
- Only show months that have at least one expense.
- Data is read-only — no editing or adding expenses from the comparison view.
- Comparison section appears right after the CTA card when toggled.

## Out of Scope

- Charts, graphs, or any visualization beyond a plain HTML table.
- Editing expenses from the comparison view.
- Comparing across years (single year only, derived from available data).
- Exporting the comparison table.
- Persisting the comparison view state between sessions.

## Decisions

- CTA SHALL appear as a card below the summary grid, styled like the action panel.
- CTA SHALL only be visible when 2+ months contain expenses.
- Button SHALL use primary/accent color (not secondary/outline).
- Comparison section SHALL sit directly after the CTA card, not after the action panel.
- The table SHALL use fixed categories as rows and months as columns.
- Each cell SHALL show the total formatted in BRL.
- A "Total" row at the bottom SHALL sum each month column.
- Only months that contain expenses SHALL appear as columns.
- On mobile, the CTA SHALL stack vertically and the button SHALL be full-width.
- The table SHALL horizontally scroll on all screen sizes without sticky columns.
- The comparison SHALL derive data directly from `state.expenses` via `getMonthlyComparison()`.
- No external libraries SHALL be added.
