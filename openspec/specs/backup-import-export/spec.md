# Backup Import Export Specification

## Purpose

Defines how users export and import local expense data.

## Requirements

### Requirement: Export Backup

The application SHALL allow the user to export all saved expense data as a JSON backup file.

#### Scenario: Exporting data

- **GIVEN** the user has any current local data state
- **WHEN** the user chooses to export data
- **THEN** the application SHALL download a file named `{timestamp}.gastos.json`
- **AND** the timestamp SHALL be derived from the export time in a filesystem-safe ISO-like format
- **AND** the file SHALL contain JSON
- **AND** include app identifier, backup version, export timestamp, selected month, months list, and expenses list

### Requirement: Validate Imported Backup

The application SHALL validate imported backup files before applying them.

#### Scenario: Unsupported file

- **GIVEN** the user selects a file that is not a valid backup for this application
- **WHEN** the application parses the file
- **THEN** it SHALL reject the import
- **AND** show feedback explaining that the file is invalid or unsupported

#### Scenario: Invalid expense data

- **GIVEN** the backup file contains expenses without a name or positive value
- **WHEN** the application validates the file
- **THEN** it SHALL reject the import
- **AND** keep existing local data unchanged

### Requirement: Merge Imported Data

The application SHALL allow imported data to be merged with current local data.

#### Scenario: Merge enabled

- **GIVEN** merge import is enabled
- **WHEN** the user imports a valid backup
- **THEN** imported expenses SHALL be merged with current expenses by expense identity
- **AND** matching identities SHALL be replaced by imported data
- **AND** non-matching current expenses SHALL be preserved

### Requirement: Replace Imported Data

The application SHALL allow imported data to replace current local data after confirmation.

#### Scenario: Replace confirmed

- **GIVEN** merge import is disabled
- **WHEN** the user imports a valid backup
- **AND** confirms replacement
- **THEN** current local expenses SHALL be replaced by imported expenses

#### Scenario: Replace cancelled

- **GIVEN** merge import is disabled
- **WHEN** the user imports a valid backup
- **AND** cancels replacement
- **THEN** current local expenses SHALL remain unchanged
