# PWA Offline Specification

## ADDED Requirements

### Requirement: Installable Web App

The application SHALL provide install metadata for browsers that support Progressive Web App installation.

#### Scenario: Reading install metadata

- **GIVEN** the browser supports web app manifests
- **WHEN** the application is loaded
- **THEN** the browser SHALL be able to read the app name, short name, start URL, scope, display mode, theme color, background color, and icon metadata from the manifest

#### Scenario: Reading install icons

- **GIVEN** the browser supports web app manifests
- **WHEN** the application manifest is loaded
- **THEN** the manifest SHALL include PNG icons for `192x192` and `512x512` sizes
- **AND** include a maskable icon for compatible launchers
- **AND** MAY include the SVG icon as a scalable fallback

#### Scenario: Standalone launch

- **GIVEN** the user installs the application
- **WHEN** the user launches it from the installed app shortcut
- **THEN** the application SHALL open within the configured app scope
- **AND** preserve the same local data behavior as the browser version

#### Scenario: Native install action

- **GIVEN** the browser reports that native PWA installation is available
- **WHEN** the application is loaded
- **THEN** the header SHALL expose a compact install action
- **AND** activating the action SHALL trigger the browser-native install prompt

#### Scenario: Install action unavailable

- **GIVEN** the browser does not report that native PWA installation is available
- **WHEN** the application is loaded
- **THEN** the header SHALL NOT show the install action

### Requirement: Service Worker Registration

The application SHALL register a Service Worker when the browser supports Service Workers.

#### Scenario: Supported browser

- **GIVEN** the browser supports Service Workers
- **WHEN** the application loads over a secure context or localhost
- **THEN** the application SHALL attempt to register the Service Worker
- **AND** SHALL keep the main interface usable if registration is delayed

#### Scenario: Unsupported browser

- **GIVEN** the browser does not support Service Workers
- **WHEN** the application loads
- **THEN** the application SHALL remain usable as a normal static web page
- **AND** SHALL NOT show blocking errors related to offline support

#### Scenario: Registration failure

- **GIVEN** Service Worker registration fails
- **WHEN** the application loads
- **THEN** the application SHALL remain usable online
- **AND** SHALL NOT block expense entry, imports, exports, theme preference, or local persistence

### Requirement: Offline App Shell

The Service Worker SHALL cache the static application shell required to open the app after an initial successful visit.

#### Scenario: First online visit

- **GIVEN** the user opens the application with a working network connection
- **WHEN** the Service Worker installs
- **THEN** it SHALL cache the core static assets needed to render the application shell
- **AND** include local HTML, CSS, JavaScript modules, manifest, and icon assets

### Requirement: Local Core CSS Dependencies

The application SHALL serve core CSS dependencies required for initial rendering from repository-local static files.

#### Scenario: Loading styles without CDN availability

- **GIVEN** the browser can access the static repository files
- **AND** the third-party CSS CDN is unavailable
- **WHEN** the application loads
- **THEN** the main interface SHALL still load its core CSS dependencies from local static files
- **AND** render the app shell without requiring a CDN request

#### Scenario: Caching local CSS dependencies

- **GIVEN** the Service Worker installs after a successful online visit
- **WHEN** it caches the application shell
- **THEN** it SHALL include the local core CSS dependency files in the app-shell cache

#### Scenario: Revisit while offline

- **GIVEN** the user has successfully loaded the application online before
- **AND** the Service Worker has cached the app shell
- **WHEN** the user opens the application without a network connection
- **THEN** the application SHALL load from cached assets
- **AND** show the user's locally stored expenses from the current browser storage

#### Scenario: Missing uncached asset

- **GIVEN** a requested asset was not cached
- **WHEN** the browser requests it while offline
- **THEN** the Service Worker SHALL fail gracefully
- **AND** SHALL NOT corrupt saved expense data

### Requirement: Local-First Offline Data

Offline support SHALL preserve the existing local-only data model.

#### Scenario: Using saved expenses offline

- **GIVEN** the user has expenses saved in the current browser
- **AND** the app shell is available offline
- **WHEN** the user opens the app offline
- **THEN** the application SHALL read expenses from local browser storage
- **AND** allow the user to view, add, edit, remove, sort, and bulk edit local expenses

#### Scenario: Local file operations while offline

- **GIVEN** the application is running offline
- **WHEN** the user selects a local OFX or `.gastos.json` file
- **THEN** the application SHALL process the selected local file without requiring network access

#### Scenario: Exporting while offline

- **GIVEN** the application is running offline
- **WHEN** the user exports a backup
- **THEN** the application SHALL generate the backup from local data without requiring network access

### Requirement: Cache Updates

The Service Worker SHALL support replacing older cached application assets after a new deployment.

#### Scenario: New app version is deployed

- **GIVEN** a new deployment changes one or more cached assets
- **WHEN** the user revisits the application with a network connection
- **THEN** the Service Worker SHALL be able to install a newer cache version
- **AND** remove older app-shell caches that are no longer current

#### Scenario: Existing offline session

- **GIVEN** the user is already using a cached version of the app
- **WHEN** a newer Service Worker is available
- **THEN** the current session SHALL remain usable
- **AND** the newer cached assets MAY take effect on reload or revisit

### Requirement: Cached Asset Version Discipline

Changes to cached app-shell files SHALL include an app/cache version bump so users can receive updated assets after deployment.

#### Scenario: Cached file changes

- **GIVEN** a contributor changes a file included in the app-shell cache
- **WHEN** the change is prepared for deployment
- **THEN** the contributor SHALL bump the app/cache version used by the Service Worker
- **AND** the new version SHALL cause the Service Worker to create a fresh cache for the updated assets

#### Scenario: Non-cached file changes

- **GIVEN** a contributor changes files that are not part of the app-shell cache
- **WHEN** the change is prepared for deployment
- **THEN** an app/cache version bump is not required solely for that non-cached change

#### Scenario: Documentation-only changes

- **GIVEN** a contributor changes documentation or OpenSpec files only
- **WHEN** no cached app-shell file changes
- **THEN** an app/cache version bump is not required
