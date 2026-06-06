# Project Context

## Purpose

Totalizador de Gastos Mensais is a static, client-side web app for recording, importing, and comparing monthly expenses. It focuses on clarity and low maintenance, with no backend, login, or build step.

The project prioritizes clarity, low maintenance, and GitHub Pages publishing over framework complexity.

## Stack

- HTML, CSS, and vanilla JavaScript served as static files
- Pico CSS served locally in `vendor/pico/pico.min.css`
- Browser `localStorage`
- Service Worker for offline caching
- GitHub Actions deploy to GitHub Pages

## Implementation Notes

- `index.html` owns document structure and static UI.
- `styles.css` owns Pico overrides, layout, modal styling, and responsive behavior.
- `app-core.js` owns pure business logic (grouping, sorting, OFX parsing, validation).
- `app.js` owns state, persistence, rendering, import/export, and user interactions.
- `service-worker.js` caches static assets for offline use.
- Data is stored only in the current browser unless exported by the user.

## OpenSpec Usage

Current behavior lives in `openspec/specs/`.

Future feature work should use `openspec/changes/<change-id>/` with:

- `proposal.md`
- `tasks.md`
- optional `design.md`
- delta specs under `specs/<capability>/spec.md`

Small visual fixes can remain normal commits unless they introduce or change expected product behavior.
