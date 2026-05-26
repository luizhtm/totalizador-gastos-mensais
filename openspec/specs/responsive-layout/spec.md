# Responsive Layout Specification

## Purpose

Defines how the application adapts its layout between compact and wide viewports.

## Requirements

### Requirement: Two Layout Modes

The application SHALL use two responsive layout modes: compact for mobile and tablet viewports, and desktop for wide viewports.

#### Scenario: Compact layout for mobile and tablet widths

- **GIVEN** the viewport width is less than `1280px`
- **WHEN** the application is loaded
- **THEN** the application SHALL use the compact layout
- **AND** present primary sections in a single-column flow
- **AND** use compact header controls where space is limited
- **AND** present the expense list in a touch-friendly stacked layout

#### Scenario: Desktop layout for wide viewports

- **GIVEN** the viewport width is `1280px` or wider
- **WHEN** the application is loaded
- **THEN** the application SHALL use the desktop layout
- **AND** present summary and content sections in wider multi-column arrangements where appropriate
- **AND** present registered expenses in a table layout
- **AND** allow the category summary panel to remain visible while the user scrolls the expense list area

#### Scenario: Tablet widths do not use a separate intermediate layout

- **GIVEN** the user is viewing the application on a tablet-width viewport
- **WHEN** the viewport is less than `1280px` wide
- **THEN** the application SHALL use the same compact layout rules as mobile viewports
- **AND** SHALL NOT switch to a separate tablet-specific layout mode
