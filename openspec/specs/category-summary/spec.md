# Category Summary Specification

## Purpose

Defines how category totals are calculated and displayed.

### Requirement: Group By Category

The application SHALL group selected-month expenses by category.

#### Scenario: Category totals

- **GIVEN** multiple expenses exist in the selected month
- **WHEN** the category summary is rendered
- **THEN** the application SHALL sum expense values by category
- **AND** display each category total in Brazilian Real format

#### Scenario: Category ordering

- **GIVEN** category totals exist
- **WHEN** the category summary is rendered
- **THEN** categories SHALL be ordered from highest total to lowest total

### Requirement: Category Percentages

The application SHALL show each category's percentage of the monthly total.

#### Scenario: Percentage display

- **GIVEN** the selected month has expenses
- **WHEN** category totals are displayed
- **THEN** each category SHALL show its rounded percentage of the monthly total
- **AND** display a proportional visual bar

#### Scenario: No category data

- **GIVEN** the selected month has no expenses
- **WHEN** the category summary is rendered
- **THEN** the application SHALL show an empty-state message
- **AND** render no category rows
