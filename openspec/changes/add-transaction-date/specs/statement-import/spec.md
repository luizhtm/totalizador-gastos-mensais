# Statement Import Delta: Transaction Date

## CHANGED Requirements

### Requirement: Preserve OFX Metadata

(Updated to include date preservation.)

#### Scenario: Saving original transaction date

- **GIVEN** an OFX transaction has a posting date
- **WHEN** the user confirms import for that draft
- **THEN** the saved expense SHALL include the original transaction date from the OFX file
- **AND** the date SHALL be stored as `YYYY-MM-DD`
