# OFX Import Design

## Data Flow

1. User selects an `.ofx` file.
2. Browser reads file text with `FileReader` or `File.text()`.
3. App parses OFX transactions locally.
4. App converts candidate debit transactions into draft expenses.
5. App displays a full-page review section.
6. User edits/selects rows and confirms import.
7. App saves selected rows as ordinary expenses.

## Parsing Strategy

OFX may appear as SGML-like text or XML-like text depending on the bank/exporter.

The first implementation should support common OFX statement tags:

- `STMTTRN`
- `TRNTYPE`
- `DTPOSTED`
- `TRNAMT`
- `FITID`
- `NAME`
- `MEMO`

The parser should be defensive:

- trim values;
- handle dates with time suffixes;
- reject files without transaction rows;
- reject rows without usable date, amount, or description;
- avoid throwing raw parser errors to the user.

## Expense Mapping

Each imported debit transaction maps to a normal expense:

- `name`: OFX `NAME`, falling back to `MEMO`, falling back to a generic label
- `description`: OFX `MEMO` when it adds extra context
- `value`: absolute value of negative `TRNAMT`
- `month`: derived from `DTPOSTED`
- `category`: keyword suggestion or `Outros`
- `source`: `ofx`
- `sourceId`: OFX `FITID` when present
- `sourceData`: original OFX transaction fields used during import

The existing expense model can accept extra fields, but export/import backup behavior should preserve them unless there is a reason to strip them later.

Positive transactions are hidden by default in the first version. The first version will not include a reveal toggle because the product focus is monthly expenses only.

Preserved OFX metadata is internal/export-only. It should not appear in the normal expense list, summary, or edit modal unless a future feature explicitly needs it.

## Deduplication

When `FITID` exists, use it as the primary duplicate key.

When `FITID` is missing, derive a fallback key from:

- date;
- amount;
- normalized description.

Duplicate detection should happen before the review step and again before final save.

## Category Suggestions

Use simple local keyword rules for the first version. Examples:

- uber, 99, taxi, metro, onibus, combustivel, posto -> Transporte
- ifood, mercado, market, supermercado, mercearia, padaria, restaurante, cafe -> Alimentacao
- aluguel, condominio -> Moradia
- farmacia, drogaria, medico, hospital -> Saude
- netflix, spotify, google, apple, assinatura -> Assinaturas
- energia, luz, agua, internet, telefone -> Contas da casa
- escola, faculdade, curso, alura, udemy -> Educacao
- amazon, mercado livre, shopee, compra -> Compras

Rules should be easy to update in source code and should never save without user review.

## UI Direction

The review step should favor clarity over automation.

Recommended first version:

- action button near export/import backup actions;
- full-page review section listing extracted transactions;
- selected checkbox per row;
- editable name/category/value;
- visible count and total selected for import;
- confirm and cancel actions.

For mobile, the review UI can become stacked rows instead of a dense table.
