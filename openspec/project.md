# Project Context

## Purpose

Totalizador de Gastos Mensais is a static, client-side web app for recording monthly expenses and reading a simple monthly summary.

The project prioritizes clarity, low maintenance, and GitHub Pages publishing over framework complexity.

## Stack

- HTML served as static files
- Pico CSS from CDN, with local CSS overrides
- Vanilla JavaScript
- Browser `localStorage`
- GitHub Actions deploy to GitHub Pages

## Product Principles

- Keep the main screen optimized for reading totals and registered items.
- Keep expense entry focused and quick.
- Avoid login, backend services, databases, and build steps.
- Preserve user control over data through local storage and export/import.
- Prefer explicit, predictable UI behavior over clever automation.

## Implementation Notes

- `index.html` owns document structure and static UI.
- `styles.css` owns Pico overrides, layout, modal styling, and responsive behavior.
- `app.js` owns state, persistence, rendering, validation, import/export, and user interactions.
- Data is stored only in the current browser unless exported by the user.

## OpenSpec Usage

Current behavior lives in `openspec/specs/`.

Future feature work should use `openspec/changes/<change-id>/` with:

- `proposal.md`
- `tasks.md`
- optional `design.md`
- delta specs under `specs/<capability>/spec.md`

Small visual fixes can remain normal commits unless they introduce or change expected product behavior.
