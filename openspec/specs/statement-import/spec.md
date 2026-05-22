# Statement Import Specification

## Purpose

Defines how users import OFX statements into monthly expenses.

## Requirements

### Requirement: Select OFX File

The application SHALL allow the user to select an OFX statement file for import.

#### Scenario: Selecting an OFX file

- **GIVEN** the user is viewing the main screen
- **WHEN** the user selects an `.ofx` file
- **THEN** the application SHALL read the file locally in the browser
- **AND** SHALL NOT upload the file to a server

#### Scenario: Unsupported file content

- **GIVEN** the user selects a file that does not contain usable OFX transactions
- **WHEN** the application attempts to parse it
- **THEN** the application SHALL reject the import
- **AND** show feedback that no usable transactions were found
- **AND** keep existing expenses unchanged

### Requirement: Parse OFX Transactions

The application SHALL extract usable transaction data from OFX content.

#### Scenario: Extracting common transaction fields

- **GIVEN** an OFX file contains statement transactions
- **WHEN** the application parses the file
- **THEN** each usable transaction SHALL include a transaction date
- **AND** a numeric amount
- **AND** a description from `NAME`, `MEMO`, or equivalent available text
- **AND** a transaction identifier when available

#### Scenario: Handling OFX dates

- **GIVEN** an OFX transaction has a posting date with a timestamp suffix
- **WHEN** the application normalizes the transaction
- **THEN** the application SHALL derive the calendar date from the date prefix
- **AND** derive the expense month from that date

### Requirement: Create Draft Expenses From Debits

The application SHALL convert debit transactions into draft expenses before saving.

#### Scenario: Negative transaction amount

- **GIVEN** an OFX transaction has a negative amount
- **WHEN** the application creates import drafts
- **THEN** the draft expense value SHALL be the absolute value of the transaction amount
- **AND** the draft month SHALL match the transaction month

#### Scenario: Positive transaction amount

- **GIVEN** an OFX transaction has a positive amount
- **WHEN** the application creates import drafts
- **THEN** the transaction SHALL be hidden from the default expense review
- **AND** SHALL NOT be selected for expense import by default

#### Scenario: Positive transaction reveal

- **GIVEN** an OFX file contains positive transactions
- **WHEN** the import review is displayed
- **THEN** the application SHALL NOT provide a first-version control for revealing those positive transactions

### Requirement: Review Before Import

The application SHALL show a review step before saving imported transactions.

#### Scenario: Review extracted expenses

- **GIVEN** an OFX file contains usable debit transactions
- **WHEN** parsing finishes
- **THEN** the application SHALL show a full-page review section before saving
- **AND** each draft SHALL show date, name, category, value, and selection state
- **AND** the user SHALL be able to cancel without saving any drafts

#### Scenario: Editing draft expense

- **GIVEN** the import review is visible
- **WHEN** the user edits a draft expense name, category, or value
- **THEN** the application SHALL use the edited values if that draft is imported

#### Scenario: Selecting rows

- **GIVEN** the import review is visible
- **WHEN** the user selects or deselects draft rows
- **THEN** only selected rows SHALL be imported on confirmation

### Requirement: Suggest Categories

The application SHALL suggest categories for imported draft expenses.

#### Scenario: Keyword match

- **GIVEN** an imported transaction description matches a known keyword rule
- **WHEN** the application creates the draft expense
- **THEN** the draft category SHALL use the matching fixed category

#### Scenario: No keyword match

- **GIVEN** an imported transaction description does not match a keyword rule
- **WHEN** the application creates the draft expense
- **THEN** the draft category SHALL be `Outros`

#### Scenario: Obvious category keywords

- **GIVEN** an imported transaction description contains an obvious known merchant or term
- **WHEN** the application suggests a category
- **THEN** `Uber`, `99`, taxi, transit, or fuel terms SHALL suggest `Transporte`
- **AND** `iFood`, market, grocery, bakery, restaurant, or cafe terms SHALL suggest `Alimentacao`

### Requirement: Avoid Duplicate Imports

The application SHALL avoid importing duplicate transactions.

#### Scenario: Duplicate transaction identifier

- **GIVEN** an imported transaction has an OFX identifier already saved from a previous import
- **WHEN** the application prepares or confirms import
- **THEN** the duplicate transaction SHALL be skipped or shown as already imported
- **AND** SHALL NOT create a second expense for the same transaction

#### Scenario: Missing transaction identifier

- **GIVEN** an imported transaction does not have an OFX identifier
- **WHEN** the application checks for duplicates
- **THEN** it SHALL use a fallback key based on date, amount, and normalized description

### Requirement: Preserve OFX Metadata

The application SHALL preserve original OFX transaction metadata for imported expenses.

#### Scenario: Saving original transaction context

- **GIVEN** a draft expense was created from an OFX transaction
- **WHEN** the user confirms import for that draft
- **THEN** the saved expense SHALL include source information indicating OFX import
- **AND** preserve the original OFX identifier when available
- **AND** preserve original OFX description fields used for traceability

#### Scenario: Hiding original transaction context in normal UI

- **GIVEN** an expense was imported from OFX
- **WHEN** the normal expense list or edit modal is displayed
- **THEN** original OFX metadata SHALL NOT be shown as separate user-facing fields

### Requirement: Save Accepted Imports

The application SHALL save accepted imported drafts as ordinary monthly expenses.

#### Scenario: Confirming import

- **GIVEN** the import review contains selected draft expenses
- **WHEN** the user confirms import
- **THEN** the application SHALL save selected drafts as expenses
- **AND** update monthly totals
- **AND** update category summaries
- **AND** make imported expenses editable and removable like manually created expenses

#### Scenario: No rows selected

- **GIVEN** the import review contains no selected draft expenses
- **WHEN** the user confirms import
- **THEN** the application SHALL not save new expenses
- **AND** show feedback that no transactions were selected
