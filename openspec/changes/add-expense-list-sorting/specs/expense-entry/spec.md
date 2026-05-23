# Expense Entry Specification Delta

## ADDED Requirements

### Requirement: Sort Expense List

The application SHALL allow the user to sort the selected month's expense list by item, category, or value.

#### Scenario: Default sorting

- **GIVEN** the selected month has multiple expenses
- **WHEN** the list is first rendered
- **THEN** the expenses SHALL be sorted by item in ascending order

#### Scenario: Sorting by a list field

- **GIVEN** the selected month has multiple expenses
- **WHEN** the user chooses the item, category, or value sort field
- **THEN** the expense list SHALL reorder by the chosen field
- **AND** keep the sorting scoped to the selected month

#### Scenario: Toggling direction

- **GIVEN** a sort field is active
- **WHEN** the user chooses the same sort field again
- **THEN** the application SHALL toggle between ascending and descending order

#### Scenario: Showing the active sort

- **GIVEN** the expense list is sorted
- **WHEN** the user views the list controls
- **THEN** the application SHALL indicate the active sort field and direction

#### Scenario: Tie-breaking sorted results

- **GIVEN** two expenses have the same value for the active sort field
- **WHEN** the list is sorted
- **THEN** the application SHALL use item ascending as the secondary ordering
