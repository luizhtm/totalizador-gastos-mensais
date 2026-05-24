# Expense Entry Delta: Bulk Expense Actions

## ADDED Requirements

### Requirement: Select Multiple Expenses

The application SHALL allow the user to select multiple expenses from the selected month's expense list.

#### Scenario: Selecting expenses

- **GIVEN** the selected month has multiple expenses
- **WHEN** the user selects one or more expense rows
- **THEN** the application SHALL mark those rows as selected
- **AND** show how many expenses are selected
- **AND** show bulk action controls for the selected expenses
- **AND** keep individual edit and remove actions visible but disabled on expense rows
- **AND** explain that clearing the selection is required before editing or removing a single expense

#### Scenario: Selecting all visible monthly expenses

- **GIVEN** the selected month has multiple expenses
- **WHEN** the user uses the select-all control to select all expenses
- **THEN** the application SHALL select every expense in the selected month
- **AND** update the selected count

#### Scenario: Deselecting all selected expenses

- **GIVEN** one or more expenses are selected
- **WHEN** the user uses the select-all control to deselect all expenses
- **THEN** the application SHALL deselect every selected expense
- **AND** hide bulk-only controls

#### Scenario: Clearing selection

- **GIVEN** one or more expenses are selected
- **WHEN** the user clears the selection
- **THEN** the application SHALL deselect all expenses
- **AND** hide bulk-only controls
- **AND** enable individual edit and remove actions for expense rows

#### Scenario: Viewing list without active selection

- **GIVEN** the selected month has expenses
- **AND** no expenses are selected
- **WHEN** the expense list is rendered
- **THEN** the application SHALL show enabled individual edit and remove actions for each expense row

### Requirement: Sticky Bulk Action Bar

The application SHALL keep a bottom bulk action bar available while bulk selection is active.

#### Scenario: Sticky action bar while selected

- **GIVEN** one or more expenses are selected
- **WHEN** the user scrolls through the expense list
- **THEN** the bottom bulk action bar SHALL remain sticky
- **AND** keep the selected count and bulk action controls visible
- **AND** expose the mobile select/deselect all control in the action bar on mobile layouts

#### Scenario: Hidden action bar without selection

- **GIVEN** no expenses are selected
- **WHEN** the user scrolls through the expense list
- **THEN** the bulk action bar SHALL be hidden
- **AND** the `Itens cadastrados` header SHALL use its normal behavior

### Requirement: Bulk Category Edit

The application SHALL allow the user to update the category of all selected expenses.

#### Scenario: Applying a category to selected expenses

- **GIVEN** one or more expenses are selected
- **WHEN** the user chooses a fixed category
- **AND** confirms the bulk category edit
- **THEN** the application SHALL update only the category of each selected expense
- **AND** preserve each selected expense's item name, description, value, date, identity, and source metadata
- **AND** update all monthly summaries, category summaries, and the expense list
- **AND** clear the current selection

#### Scenario: Cancelling category edit

- **GIVEN** one or more expenses are selected
- **WHEN** the user starts a bulk category edit
- **AND** cancels before confirming
- **THEN** the application SHALL keep all selected expenses unchanged
- **AND** keep the current selection active

### Requirement: Bulk Remove Expenses

The application SHALL allow the user to remove selected expenses after confirmation.

#### Scenario: Confirming bulk removal

- **GIVEN** one or more expenses are selected
- **WHEN** the user chooses the bulk remove action
- **AND** confirms removal
- **THEN** the application SHALL remove all selected expenses from the selected month
- **AND** update all monthly summaries, category summaries, and the expense list
- **AND** clear the current selection

#### Scenario: Removing all monthly expenses through bulk removal

- **GIVEN** the selected month has expenses
- **WHEN** the user selects all expenses in the selected month
- **AND** chooses the bulk remove action
- **AND** confirms removal
- **THEN** the application SHALL remove all expenses from the selected month
- **AND** keep expenses from other months unchanged
- **AND** show the empty expense list state

#### Scenario: Cancelling bulk removal

- **GIVEN** one or more expenses are selected
- **WHEN** the user chooses the bulk remove action
- **AND** cancels the confirmation
- **THEN** the application SHALL keep all expenses unchanged
- **AND** keep the current selection active

### Requirement: Selection Scope

The application SHALL keep bulk selection scoped to the selected month and current list state.

#### Scenario: Changing month clears selection

- **GIVEN** one or more expenses are selected
- **WHEN** the user changes the month of reference
- **THEN** the application SHALL clear the current selection
- **AND** hide bulk-only controls for the new month until expenses are selected there

#### Scenario: Importing data clears selection

- **GIVEN** one or more expenses are selected
- **WHEN** the user successfully imports expenses from a backup or OFX file
- **THEN** the application SHALL clear the current selection
- **AND** render the updated expense list for the selected month

#### Scenario: Removing all visible expenses clears selection

- **GIVEN** one or more expenses are selected
- **WHEN** an action leaves the selected month with no expenses
- **THEN** the application SHALL clear the current selection
- **AND** show the empty expense list state
