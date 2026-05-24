# Monthly Summary Delta: Bulk Expense Actions

## MODIFIED Requirements

### Requirement: Clear Month

The application SHALL allow the user to remove all expenses from the selected month by selecting all monthly expenses and confirming bulk removal.

#### Scenario: Empty month clear action

- **GIVEN** the selected month has no expenses
- **WHEN** the expense list is rendered
- **THEN** the application SHALL not show a dedicated `Limpar mês` action in the `Itens cadastrados` header
- **AND** bulk removal controls SHALL remain unavailable until expenses are selected

#### Scenario: Confirmed month clear

- **GIVEN** the selected month has expenses
- **WHEN** the user selects all expenses in the selected month
- **AND** chooses the bulk remove action
- **AND** confirms the action
- **THEN** the application SHALL remove only expenses from the selected month
- **AND** keep expenses from other months unchanged
