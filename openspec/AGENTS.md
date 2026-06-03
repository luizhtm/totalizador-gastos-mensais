# OpenSpec Agent Notes

Use this directory as the source of truth for product behavior.

## Workflow

- Read `openspec/project.md` before planning non-trivial changes.
- Read relevant files under `openspec/specs/` before changing behavior.
- For new behavior, create a focused change under `openspec/changes/<change-id>/`.
- After implementation, update the affected source-of-truth spec.
- Keep specs behavioral. Avoid restating implementation details unless they affect observable behavior.

## Spec Style

- Use `### Requirement: <name>` for each behavior.
- Use `#### Scenario: <description>` for concrete cases.
- Use `GIVEN`, `WHEN`, `THEN`, and `AND` bullets.
- Prefer one focused capability per folder.
- Keep wording stable and testable.

## Cache Busting

After changing `app.js`, `styles.css`, or `index.html`, force a Service Worker cache update:

1. Bump `APP_CACHE_VERSION` in `service-worker.js`.
2. Update `?v=` query params on `styles.css` and `app.js` in both `service-worker.js` (APP_SHELL_URLS) and `index.html` to match the same version string.
3. Users must hard refresh (`Cmd+Shift+R`) or unregister the SW via DevTools → Application → Service Workers.
