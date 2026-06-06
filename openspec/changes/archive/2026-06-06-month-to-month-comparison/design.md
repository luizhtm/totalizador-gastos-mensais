# Design: Month-to-Month Comparison

## Data Model

No new data model. The comparison derives everything from `state.expenses` via `getMonthlyComparison()` in `app-core.js`:

- `months`: sorted array of unique "YYYY-MM" strings
- `rows`: array of `{ category, values }` for categories with any expense
- `monthTotals`: Map of month → total sum

## UI Structure

A CTA card appears below the summary cards when there are 2+ months with expenses. The comparison section sits right after it.

```
┌──────────────────────────────────────┐
│ Comparativo mensal           [button]│
│ Veja a evolução dos gastos...       │
└──────────────────────────────────────┘
  ↓ (when toggled)
┌──────────────────────────────────────┐
│ Categoria       2026-05    2026-06   │
│ Alimentação    R$ 400     R$ 350     │
│ Transporte     R$ 150     R$ 200     │
│ ...                                  │
│ Total          R$ 800     R$ 750     │
└──────────────────────────────────────┘
```

- CTA card: styled like the action panel (grid layout, soft shadow).
- Button: primary/accent color, full-width on mobile.
- Comparison section: hidden by default, toggled via button.
- The toggle button and the comparison table are adjacent (no gap of other panels).

## Responsive

On all screen sizes, the table wrapper has `overflow-x: auto` so months beyond the viewport are reachable via horizontal scroll.

On mobile (≤1279px):
- CTA card stacks vertically (title, description, button full-width).
- The table remains a proper `<table>` (no card conversion) with horizontal scroll.
- No sticky columns — the table scrolls naturally.

## Implementation Notes

- `getMonthlyComparison()`: pure function in `app-core.js` that groups expenses and returns `{ months, rows, monthTotals }`.
- `renderComparison()`: in `app.js`, calls `getMonthlyComparison()` and builds the DOM.
- `updateComparisonCTA()`: hides the CTA when fewer than 2 months exist.
- Highlighting of highest values was removed during UX refinement.
