# Proposal: Theme Toggle

## Summary

Add a light/dark theme toggle in the site header and apply the user's system theme automatically when no manual preference exists.

## Motivation

The app is used for reading financial information for longer sessions. A dark mode improves comfort in low-light environments, while automatic system detection keeps the default experience aligned with the user's device settings.

## Scope

- Add a theme control to the right side of the top header.
- Support automatic, light, and dark theme modes.
- Detect the operating system/browser color-scheme preference when automatic mode is active.
- Allow the user to choose automatic, light, or dark mode.
- Persist the selected theme mode in the current browser.
- Keep all data local; theme preference must not require login or network services.

## Out of Scope

- More than two themes.
- Per-month or per-file theme settings.
- Server-side theme persistence.
- Theme scheduling by time of day.

## Decisions

- The theme control SHALL expose three modes: automatic, light, and dark.
- Automatic mode SHALL use the system color-scheme preference when the application loads.
- The application does not need to update the active theme live if the system preference changes while the page is already open.
