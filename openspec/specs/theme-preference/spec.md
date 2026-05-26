# Theme Preference Specification

## Purpose

Defines how the application chooses and presents light, dark, and automatic theme modes.

## Requirements

### Requirement: Automatic Theme Mode

The application SHALL provide an automatic theme mode that applies the user's system color-scheme preference when the application loads.

#### Scenario: Automatic mode with dark system preference

- **GIVEN** the selected theme mode is automatic
- **AND** the system color-scheme preference is dark
- **WHEN** the application loads
- **THEN** the application SHALL use the dark theme

#### Scenario: Automatic mode with light system preference

- **GIVEN** the selected theme mode is automatic
- **AND** the system color-scheme preference is light
- **WHEN** the application loads
- **THEN** the application SHALL use the light theme

#### Scenario: System preference changes after load

- **GIVEN** the selected theme mode is automatic
- **AND** the application is already loaded
- **WHEN** the system color-scheme preference changes
- **THEN** the application does not need to change the active theme until the user reloads or revisits the application

### Requirement: Theme Mode Toggle

The application SHALL allow the user to choose automatic, light, or dark mode from the top header.

#### Scenario: Switching from light to dark

- **GIVEN** the application is using the light theme
- **WHEN** the user activates the theme toggle
- **THEN** the application SHALL switch to the dark theme
- **AND** show the active theme state in the toggle

#### Scenario: Switching from dark to light

- **GIVEN** the application is using the dark theme
- **WHEN** the user activates the theme toggle
- **THEN** the application SHALL switch to the light theme
- **AND** show the active theme state in the toggle

#### Scenario: Switching to automatic mode

- **GIVEN** the application is using a manually selected theme
- **WHEN** the user selects automatic mode
- **THEN** the application SHALL apply the current system color-scheme preference
- **AND** show automatic mode as the active theme state

#### Scenario: Header placement

- **GIVEN** the user is viewing the top header
- **WHEN** the application is loaded
- **THEN** the theme toggle SHALL appear on the right side of the header
- **AND** remain visually aligned with the app identity on the left

### Requirement: Persist Theme Mode

The application SHALL remember the user's selected theme mode in the current browser.

#### Scenario: Reloading after mode selection

- **GIVEN** the user selected automatic, light, or dark theme mode
- **WHEN** the user reloads or revisits the application in the same browser
- **THEN** the application SHALL restore the saved theme mode
- **AND** apply the corresponding active theme

#### Scenario: Applying theme before first paint

- **GIVEN** the user previously selected dark mode
- **WHEN** the user reloads or revisits the application
- **THEN** the application SHALL apply the dark theme during initial document loading
- **AND** avoid briefly presenting the light theme before the main script finishes loading

#### Scenario: Local-only preference

- **GIVEN** the user selected a theme mode
- **WHEN** the preference is saved
- **THEN** the application SHALL store the preference locally in the browser
- **AND** SHALL NOT require login, backend services, or network requests

### Requirement: Theme Coverage

The application SHALL keep the interface readable and consistent in both light and dark themes.

#### Scenario: Viewing primary surfaces

- **GIVEN** either light or dark theme is active
- **WHEN** the user views the main screen
- **THEN** header, hero, privacy callout, summary cards, action panel, category summary, expense list, import review, modals, buttons, and form controls SHALL remain readable
- **AND** interactive controls SHALL keep visible focus, hover, active, and disabled states
