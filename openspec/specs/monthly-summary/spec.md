# Monthly Summary Specification

## Purpose

Defines how the application summarizes the selected month.

### Requirement: Month Selection

The application SHALL display data for the currently selected month.

#### Scenario: Default month

- **GIVEN** the application is opened for the first time
- **WHEN** no saved selected month exists
- **THEN** the application SHALL select the current calendar month

#### Scenario: Changing month

- **GIVEN** the user is viewing a selected month
- **WHEN** the user changes the month field
- **THEN** the application SHALL display expenses for the new selected month
- **AND** persist the selected month locally

### Requirement: Monthly Total

The application SHALL show the total value of all expenses in the selected month.

#### Scenario: Empty month

- **GIVEN** the selected month has no expenses
- **WHEN** the summary is rendered
- **THEN** the total SHALL be `R$ 0,00`
- **AND** the expense count SHALL be `0`
- **AND** the top category SHALL be `-`

#### Scenario: Month with expenses

- **GIVEN** the selected month has one or more expenses
- **WHEN** the summary is rendered
- **THEN** the total SHALL equal the sum of expense values for that month
- **AND** the expense count SHALL equal the number of expenses for that month
- **AND** the top category SHALL be the category with the largest total

### Requirement: Clear Month

The application SHALL allow the user to remove all expenses from the selected month after confirmation.

#### Scenario: Empty month clear action

- **GIVEN** the selected month has no expenses
- **WHEN** the user chooses to clear the month
- **THEN** the application SHALL keep data unchanged
- **AND** show feedback that there are no expenses to clear

#### Scenario: Confirmed month clear

- **GIVEN** the selected month has expenses
- **WHEN** the user chooses to clear the month
- **AND** confirms the action
- **THEN** the application SHALL remove only expenses from the selected month
- **AND** keep expenses from other months unchanged
