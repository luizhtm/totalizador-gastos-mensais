# Monthly Comparison Specification

## Purpose

Defines how users compare expenses across multiple months in a single table view.

## Requirements

### Requirement: Toggle Comparison View

The application SHALL allow the user to show and hide the month-to-month comparison view.

#### Scenario: Opening the comparison

- **GIVEN** the user is viewing the main screen
- **WHEN** the user activates the comparison toggle
- **THEN** the application SHALL display the comparison table below the action panel
- **AND** the table SHALL show all months that contain at least one expense

#### Scenario: Closing the comparison

- **GIVEN** the comparison table is visible
- **WHEN** the user deactivates the comparison toggle
- **THEN** the application SHALL hide the comparison table
- **AND** the main screen SHALL return to its previous layout

### Requirement: Comparison Table Structure

The application SHALL display a table with categories as rows and months as columns.

#### Scenario: Table headers

- **GIVEN** the comparison table is visible
- **WHEN** the table is rendered
- **THEN** the first column header SHALL be "Categoria"
- **AND** each subsequent column header SHALL show the month label (e.g., "Maio 2026")
- **AND** months SHALL be ordered chronologically

#### Scenario: Category rows

- **GIVEN** the comparison table is visible
- **WHEN** a category has expenses in at least one displayed month
- **THEN** the category row SHALL show the total per month in each month column
- **AND** the value SHALL be formatted in BRL (`R$ X.XXX,XX`)
- **AND** categories with no expenses at all SHALL be omitted from the table

#### Scenario: Empty months excluded

- **GIVEN** the comparison table is visible
- **WHEN** a month has no expenses across all categories
- **THEN** that month SHALL NOT appear as a column

### Requirement: Highlight Highest Category

The application SHALL highlight the highest value in each category row.

#### Scenario: Highest month highlighted

- **GIVEN** a category row has multiple months with values
- **WHEN** the table is rendered
- **THEN** the cell with the highest value in that row SHALL receive a visual highlight
- **AND** if two months share the same highest value, no cell SHALL be highlighted for that row

### Requirement: Monthly Total Row

The application SHALL show a total row at the bottom of the table.

#### Scenario: Total per month

- **GIVEN** the comparison table has at least one month column
- **WHEN** the table is rendered
- **THEN** the last row SHALL display "Total" as the category label
- **AND** each month column SHALL show the sum of all category values for that month
