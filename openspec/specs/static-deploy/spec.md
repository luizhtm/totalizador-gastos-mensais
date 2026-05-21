# Static Deploy Specification

## Purpose

Defines how the project is published as a static GitHub Pages site.

### Requirement: Static Site

The project SHALL be deployable as static files without a build step.

#### Scenario: Serving the site

- **GIVEN** the repository files are served from a static host
- **WHEN** the browser loads `index.html`
- **THEN** the application SHALL load its stylesheet and script from repository-relative paths
- **AND** require no server-side code

### Requirement: GitHub Pages Workflow

The repository SHALL include a GitHub Actions workflow for GitHub Pages deployment.

#### Scenario: Push to main

- **GIVEN** a commit is pushed to the `main` branch
- **WHEN** GitHub Actions runs the Pages workflow
- **THEN** the workflow SHALL upload the repository static files as the Pages artifact
- **AND** deploy the artifact to GitHub Pages

#### Scenario: Manual deployment

- **GIVEN** a maintainer opens the workflow in GitHub Actions
- **WHEN** the maintainer runs the workflow manually
- **THEN** the workflow SHALL deploy the current branch configuration to GitHub Pages
