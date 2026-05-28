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
- **AND** the form SHALL start empty
- **AND** the category field SHALL show a `Selecione uma categoria` placeholder without selecting a category
- **AND** the primary action SHALL be disabled until required fields are valid

#### Scenario: Saving a new expense

- **GIVEN** the expense modal is open
- **WHEN** the user enters a name, category, positive value, and optional description
- **AND** the user submits the form
- **THEN** the application SHALL save the expense for the selected month
- **AND** close the modal
- **AND** update all monthly summaries and lists

#### Scenario: Rejecting missing required data

- **GIVEN** the expense modal is open
- **WHEN** the user submits without a name, a fixed category, or a value greater than zero
- **THEN** the application SHALL reject the expense
- **AND** show feedback explaining that name, category, and positive value are required

#### Scenario: Keyboard-assisted form navigation

- **GIVEN** the expense modal is open
- **WHEN** the user presses Enter in the item name field
- **THEN** the application SHALL move focus to the category field
- **WHEN** the user presses Enter in the value field after required fields are valid
- **THEN** the application SHALL submit the form
- **AND** pressing Enter in the description field SHALL preserve normal multiline text entry
- **AND** pressing Ctrl+Enter or Command+Enter in the description field SHALL submit the form when the primary action is enabled

### Requirement: Edit Expense

The application SHALL allow the user to edit an existing expense using the same modal form.

#### Scenario: Opening an existing expense

- **GIVEN** at least one expense exists in the selected month
- **WHEN** the user chooses to edit that expense
- **THEN** the application SHALL open the modal form
- **AND** populate it with the existing expense data
- **AND** change the primary action label to save changes
- **AND** keep the primary action disabled until at least one field is changed

#### Scenario: Saving edits

- **GIVEN** the user is editing an existing expense
- **WHEN** the user submits valid changes
- **THEN** the application SHALL update the existing expense
- **AND** keep the same expense identity
- **AND** close the modal
- **AND** update all monthly summaries and lists

#### Scenario: Reverting edits disables saving

- **GIVEN** the user is editing an existing expense
- **WHEN** the user changes a field and then restores every field to its original value
- **THEN** the save changes action SHALL be disabled

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

#### Scenario: Waiting for a bulk category selection

- **GIVEN** one or more expenses are selected
- **WHEN** the bulk action bar is shown
- **THEN** the bulk category field SHALL show a `Selecione uma categoria` placeholder without selecting a category
- **AND** the bulk category edit action SHALL be disabled until a fixed category is selected

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
