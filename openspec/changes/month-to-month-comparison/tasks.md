# Tasks: Month-to-Month Comparison

## Implementation

- [x] Add CTA card below summary grid in `index.html` (hidden by default).
- [x] Add comparison section right after CTA card in `index.html` (hidden by default).
- [x] Extract `getMonthlyComparison()` to `app-core.js` for testability.
- [x] Implement `renderComparison()` in `app.js` to build the table from grouped data.
- [x] Group expenses by month and category with summed totals.
- [x] Render category rows in fixed category order with month columns.
- [x] Add total row per month column.
- [x] Wire toggle button to show/hide the comparison section.
- [x] Show CTA only when 2+ months have expenses (`updateComparisonCTA()`).
- [x] Call `renderComparison()` and `updateComparisonCTA()` during `render()`.
- [x] Remove highlight of highest cell per row (UX refinement).
- [x] Add description text to CTA card.
- [x] Style CTA like action panel (grid layout, soft shadow, accent button).
- [x] Table horizontally scrollable on all screen sizes.
- [x] No sticky columns on mobile.
- [x] Mobile: CTA stacks vertically, button full-width.

## Verification

- [x] Verify table shows correct totals per category per month.
- [x] Verify total row sums match each month column.
- [x] Verify toggle shows/hides the panel.
- [x] Verify CTA is hidden with 0-1 months, visible with 2+ months.
- [x] Verify adding/editing/removing an expense updates the comparison on next render.
- [x] Verify horizontal scroll works on both desktop and mobile.
- [x] Unit tests for `getMonthlyComparison()`.
