# Expense Entry Specification

## Purpose

Defines how users add, edit, and remove monthly expense items.

## Requirements

### Requirement: Add Expense

The application SHALL allow the user to add an expense for the selected month.

#### Scenario: Opening the add expense modal

- **GIVEN** the user is viewing the main screen
- **WHEN** the user chooses to add an expense
- **THEN** the application SHALL open a modal form
- **AND** the form SHALL start empty with the default category selected

#### Scenario: Saving a new expense

- **GIVEN** the expense modal is open
- **WHEN** the user enters a name, category, positive value, and optional description
- **AND** the user submits the form
- **THEN** the application SHALL save the expense for the selected month
- **AND** close the modal
- **AND** update all monthly summaries and lists

#### Scenario: Rejecting invalid value

- **GIVEN** the expense modal is open
- **WHEN** the user submits a value that is not greater than zero
- **THEN** the application SHALL reject the expense
- **AND** show feedback explaining that the value must be greater than zero

### Requirement: Edit Expense

The application SHALL allow the user to edit an existing expense using the same modal form.

#### Scenario: Opening an existing expense

- **GIVEN** at least one expense exists in the selected month
- **WHEN** the user chooses to edit that expense
- **THEN** the application SHALL open the modal form
- **AND** populate it with the existing expense data
- **AND** change the primary action label to save changes

#### Scenario: Saving edits

- **GIVEN** the user is editing an existing expense
- **WHEN** the user submits valid changes
- **THEN** the application SHALL update the existing expense
- **AND** keep the same expense identity
- **AND** close the modal
- **AND** update all monthly summaries and lists

### Requirement: Remove Expense

The application SHALL allow the user to remove an existing expense after confirmation.

#### Scenario: Confirmed removal

- **GIVEN** an expense exists in the selected month
- **WHEN** the user chooses to remove it
- **AND** confirms removal
- **THEN** the application SHALL remove the expense
- **AND** update all monthly summaries and lists

#### Scenario: Cancelled removal

- **GIVEN** an expense exists in the selected month
- **WHEN** the user chooses to remove it
- **AND** cancels confirmation
- **THEN** the application SHALL keep the expense unchanged

### Requirement: Fixed Categories

The application SHALL require each expense to use one of the fixed categories.

#### Scenario: Selecting a category

- **GIVEN** the expense form is open
- **WHEN** the user opens the category field
- **THEN** the application SHALL show the predefined category list
- **AND** include `Outros` for expenses that do not fit the main categories
