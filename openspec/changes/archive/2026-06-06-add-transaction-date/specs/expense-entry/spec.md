# Expense Entry Delta: Transaction Date

## ADDED Requirements

### Requirement: Transaction Date on Add

The application SHALL show an editable date field when adding a new expense, defaulting to today's date.

#### Scenario: Date field in add mode

- **GIVEN** the add expense modal is open
- **WHEN** the form is rendered
- **THEN** the application SHALL display a date field with today's date pre-filled
- **AND** the date field SHALL be editable

#### Scenario: User changes the date on add

- **GIVEN** the add expense modal is open
- **WHEN** the user picks a different date
- **THEN** the application SHALL accept the user-chosen date
- **AND** the new expense SHALL be saved with that date

### Requirement: Transaction Date on Edit

The application SHALL show the saved transaction date as a read-only field when editing an existing expense.

#### Scenario: Date field in edit mode

- **GIVEN** the edit expense modal is open for an expense with a saved date
- **WHEN** the form is rendered
- **THEN** the application SHALL display the date field populated with the saved date
- **AND** the date field SHALL be read-only

#### Scenario: Date field for legacy expenses

- **GIVEN** the edit expense modal is open for an expense without a saved date
- **WHEN** the form is rendered
- **THEN** the application SHALL display the date field empty
- **AND** the date field SHALL be read-only

### Requirement: Date in Expense List

The application SHALL display the transaction date in the expense list.

#### Scenario: Expense with date

- **GIVEN** an expense has a saved transaction date
- **WHEN** the expense list is rendered
- **THEN** the application SHALL show the date formatted as `dd/mm/aaaa`
- **AND** the date SHALL appear in a dedicated column

#### Scenario: Expense without date

- **GIVEN** an expense does not have a saved transaction date
- **WHEN** the expense list is rendered
- **THEN** the application SHALL show `—` in the date column

### Requirement: Sort by Date

The application SHALL allow the user to sort the selected month's expense list by date.

#### Scenario: Sorting by date ascending

- **GIVEN** the selected month has multiple expenses with dates
- **WHEN** the user chooses the date sort field
- **THEN** the expense list SHALL reorder by date in ascending order (oldest first)
- **AND** expenses without a date SHALL appear last
- **AND** keep the sorting scoped to the selected month

#### Scenario: Toggling date sort direction

- **GIVEN** the date sort field is active
- **WHEN** the user chooses the date sort field again
- **THEN** the application SHALL toggle between ascending (oldest first) and descending (newest first)

#### Scenario: Tie-breaking date sort

- **GIVEN** two expenses have the same date
- **WHEN** the list is sorted by date
- **THEN** the application SHALL use item ascending as the secondary ordering
