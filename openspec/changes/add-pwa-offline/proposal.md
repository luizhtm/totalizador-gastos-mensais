# Add PWA Offline Support

## Summary

Transform the static expense tracker into an installable PWA with offline support through a Service Worker.

## Motivation

The application already runs fully in the browser and stores user data locally. PWA support fits this model by allowing users to open the app from the device home screen and continue using previously loaded assets without a network connection.

## Scope

- Register a Service Worker from the static app.
- Cache the application shell and local static assets needed to open the app offline.
- Serve core CSS dependencies from repository-local static files instead of relying on a CDN at runtime.
- Keep the existing local-first data model unchanged.
- Preserve GitHub Pages compatibility, including repository subpath deployment.
- Keep the app functional when Service Workers are unsupported.
- Ensure updates to deployed assets can replace older cached versions.

## Out of Scope

- Background sync.
- Push notifications.
- Server-side storage or login.
- Offline parsing of files that were not selected locally by the user.
- Complex runtime caching for arbitrary third-party resources beyond what is required for the app shell.
- Custom install prompts or onboarding flows.

## Decisions

- The PWA will use a small hand-written Service Worker rather than a build tool.
- The Service Worker will use versioned caches so a new deployment can refresh the app shell.
- Any code or static asset change that affects cached app-shell files must bump the app/cache version in the Service Worker update mechanism.
- The app should prioritize predictable static-host behavior over advanced cache strategies.
- Pico CSS should be vendored into the repository as a versioned local file so the app shell can render reliably offline and without CDN availability.
- The Service Worker should be registered with a repository-relative path so GitHub Pages subpath deployments use the repository path as the default scope.
- The existing `site.webmanifest` should remain the source for install metadata and may be expanded only as needed.

## Risks

- Cached assets can become stale if the Service Worker update flow is too conservative.
- Cached assets can remain stale if contributors change cached files without bumping the cache/app version.
- Vendored CSS can become stale if upstream Pico CSS is updated and the local copy is not intentionally refreshed.
- Service Worker scope must be compatible with GitHub Pages repository paths.
