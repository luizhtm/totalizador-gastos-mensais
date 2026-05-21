# Import OFX Statements

## Summary

Add an OFX statement import flow so users can bring multiple bank transactions into the monthly expense tracker without typing each expense manually.

The import must run locally in the browser, show a review step before saving, and avoid adding obvious duplicates.

## Motivation

Manual expense entry is accurate but tedious. Users often already have transaction data in their bank export files. OFX is a better first import target than CSV/PDF because it is designed for financial statements and usually includes transaction date, amount, description, and an identifier.

## Goals

- Let the user select an `.ofx` file from their device.
- Parse transactions locally in the browser.
- Treat negative transactions as expenses by default.
- Show a full-page review section before importing anything.
- Suggest categories from transaction descriptions.
- Allow the user to edit category, name, value, and selection before import.
- Avoid duplicate imports using OFX identifiers when available.
- Preserve original OFX transaction metadata for traceability.
- Save accepted transactions as normal monthly expenses.

## Non-Goals

- Import PDF bank statements.
- Import XLSX or CSV files.
- Sync directly with bank APIs.
- Store uploaded files after parsing.
- Automatically infer perfect categories.
- Import income as first-version behavior.
- Support every malformed OFX variant silently.

## User Impact

Users can export OFX from a bank, import it into the app, review extracted transactions, and save many monthly expenses at once.

The main expense list remains the source of truth after import. Imported expenses should behave like manually created expenses: they can be edited, removed, exported in `.gastos.json`, and included in monthly/category summaries.

## Decisions

- The review UI will be a full-page section because imported statements can contain many transactions.
- Positive transactions will be hidden by default in the first version.
- The first version will not include a toggle to reveal positive transactions because the product focus is monthly expenses only.
- Original OFX metadata will be preserved on imported expenses to simplify traceability and future deduplication.
- Preserved OFX metadata will remain internal/export-only and will not appear in the normal expense UI.
- Initial category suggestions will use obvious keyword rules such as Uber/99 for Transporte and iFood/market/supermercado for Alimentacao.
