# Tasks

## Specification

- [x] Define PWA install and offline behavior.
- [x] Decide static Service Worker scope and cache strategy.
- [x] Document GitHub Pages Service Worker compatibility and local Pico CSS rationale.

## Implementation

- [x] Add a Service Worker file at the static site root.
- [x] Register the Service Worker from the main app when supported by the browser.
- [x] Add a repository-local copy of Pico CSS under a vendor/static assets path.
- [x] Replace the runtime Pico CDN stylesheet link with the local Pico CSS file.
- [x] Cache the app shell: `index.html`, local CSS, local JavaScript modules, manifest, and icons.
- [x] Add an explicit app/cache version constant used by the Service Worker.
- [x] Document that cached app-shell file changes must bump the app/cache version.
- [x] Ensure the app can load from the GitHub Pages repository path.
- [x] Keep the app usable when Service Worker registration fails or is unsupported.
- [x] Update the manifest with installable PNG icons and stable app identity.
- [x] Avoid breaking local development over `localhost` or `127.0.0.1`.

## Validation

- [x] Verify the app loads online after a fresh visit.
- [ ] Verify the app loads offline after the first successful online visit.
- [x] Verify the main UI renders without a network request to the Pico CSS CDN.
- [x] Verify manifest icon files exist in `192x192` and `512x512` PNG sizes.
- [ ] Verify existing `localStorage` data remains available offline.
- [ ] Verify importing a local `.ofx` file still works while offline.
- [ ] Verify backup export/import still works while offline.
- [ ] Verify a changed asset version updates after reload/revisit.
- [x] Verify the app/cache version was bumped when cached code or static assets changed.
- [x] Run unit tests.
- [x] Run OpenSpec validation.
