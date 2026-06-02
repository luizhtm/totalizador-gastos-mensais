import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfxDrafts,
  formatMoneyInput,
  getCategoryTotals,
  getCurrentDate,
  getTopCategory,
  isValidDate,
  maskMoneyInputValue,
  mergeExpenses,
  normalizeCategoryName,
  normalizeStoredExpense,
  normalizeThemeMode,
  parseMoneyInput,
  parseOfxTransactions,
  removeExpensesByIds,
  resolveThemeMode,
  sortExpenses,
  sumExpenses,
  suggestCategory,
  updateExpenseCategoryByIds,
  validateBackup,
} from "../app-core.js";

test("formats and parses money values in pt-BR format", () => {
  assert.equal(maskMoneyInputValue("1"), "0,01");
  assert.equal(maskMoneyInputValue("1234"), "12,34");
  assert.equal(maskMoneyInputValue("123456"), "1.234,56");
  assert.equal(formatMoneyInput(1234.5), "1.234,50");
  assert.equal(parseMoneyInput("1.234,56"), 1234.56);
  assert.ok(Number.isNaN(parseMoneyInput("abc")));
});

test("normalizes and resolves theme modes", () => {
  assert.equal(normalizeThemeMode("auto"), "auto");
  assert.equal(normalizeThemeMode("light"), "light");
  assert.equal(normalizeThemeMode("dark"), "dark");
  assert.equal(normalizeThemeMode("unknown"), "auto");
  assert.equal(resolveThemeMode("auto", true), "dark");
  assert.equal(resolveThemeMode("auto", false), "light");
  assert.equal(resolveThemeMode("light", true), "light");
  assert.equal(resolveThemeMode("dark", false), "dark");
});

test("summarizes expenses by category and finds the top category", () => {
  const expenses = [
    { category: "Alimentação", value: 25.5 },
    { category: "Transporte", value: 12 },
    { category: "Alimentação", value: 14.5 },
  ];
  const totals = getCategoryTotals(expenses);

  assert.equal(sumExpenses(expenses), 52);
  assert.deepEqual(totals, [
    { category: "Alimentação", total: 40 },
    { category: "Transporte", total: 12 },
  ]);
  assert.deepEqual(getTopCategory(totals), { category: "Alimentação", total: 40 });
});

test("sorts expenses by item, category, and value", () => {
  const expenses = [
    { name: "Uber", category: "Transporte", value: 25 },
    { name: "Aluguel", category: "Moradia", value: 1200 },
    { name: "iFood", category: "Alimentação", value: 60 },
    { name: "Internet", category: "Contas da casa", value: 100 },
  ];

  assert.deepEqual(sortExpenses(expenses).map((expense) => expense.name), [
    "Aluguel",
    "iFood",
    "Internet",
    "Uber",
  ]);
  assert.deepEqual(sortExpenses(expenses, { field: "category", direction: "asc" }).map((expense) => expense.name), [
    "iFood",
    "Internet",
    "Aluguel",
    "Uber",
  ]);
  assert.deepEqual(sortExpenses(expenses, { field: "value", direction: "desc" }).map((expense) => expense.name), [
    "Aluguel",
    "Internet",
    "iFood",
    "Uber",
  ]);

  const datedExpenses = [
    { name: "C", date: "2026-06-15", category: "A", value: 1 },
    { name: "A", date: "2026-06-01", category: "B", value: 2 },
    { name: "B", date: undefined, category: "C", value: 3 },
    { name: "D", date: "2026-06-10", category: "D", value: 4 },
  ];

  assert.deepEqual(
    sortExpenses(datedExpenses, { field: "date", direction: "asc" }).map((e) => e.name + ":" + (e.date || "—")),
    ["A:2026-06-01", "D:2026-06-10", "C:2026-06-15", "B:—"],
  );
  assert.deepEqual(
    sortExpenses(datedExpenses, { field: "date", direction: "desc" }).map((e) => e.name + ":" + (e.date || "—")),
    ["C:2026-06-15", "D:2026-06-10", "A:2026-06-01", "B:—"],
  );
});

test("updates categories and removes expenses by selected ids", () => {
  const expenses = [
    { id: "1", name: "Uber", category: "Transporte", value: 25 },
    { id: "2", name: "iFood", category: "Alimentação", value: 60 },
    { id: "3", name: "Internet", category: "Contas da casa", value: 100 },
  ];

  const updated = updateExpenseCategoryByIds(expenses, ["1", "2"], "Compras");

  assert.equal(updated[0].category, "Compras");
  assert.equal(updated[1].category, "Compras");
  assert.equal(updated[2].category, "Contas da casa");
  assert.equal(expenses[0].category, "Transporte");
  assert.equal(updateExpenseCategoryByIds(expenses, ["1"], "Inexistente"), expenses);
  assert.deepEqual(removeExpensesByIds(expenses, ["1", "3"]).map((expense) => expense.id), ["2"]);
  assert.equal(removeExpensesByIds(expenses, []), expenses);
});

test("normalizes legacy and unknown categories", () => {
  assert.equal(normalizeCategoryName("Alimentacao"), "Alimentação");
  assert.equal(normalizeCategoryName("Familia"), "Família");
  assert.equal(normalizeCategoryName("Categoria que nao existe"), "Outros");
});

test("parses OFX transactions and creates expense drafts only for negative amounts", () => {
  const ofx = `
    <OFX>
      <STMTTRN>
        <TRNTYPE>DEBIT
        <DTPOSTED>20260504120000[-3:BRT]
        <TRNAMT>-103.38
        <FITID>abc-1
        <NAME>PIX QRS IFOOD COM
        <MEMO>Pedido iFood
      </STMTTRN>
      <STMTTRN>
        <TRNTYPE>CREDIT
        <DTPOSTED>20260505120000[-3:BRT]
        <TRNAMT>500.00
        <FITID>abc-2
        <NAME>PIX RECEBIDO
      </STMTTRN>
    </OFX>
  `;
  const transactions = parseOfxTransactions(ofx);
  const drafts = createOfxDrafts(transactions, [], () => "draft-1");

  assert.equal(transactions.length, 2);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].draftId, "draft-1");
  assert.equal(drafts[0].month, "2026-05");
  assert.equal(drafts[0].value, 103.38);
  assert.equal(drafts[0].category, "Alimentação");
  assert.equal(drafts[0].selected, true);
  assert.equal(drafts[0].date, "2026-05-04");
});

test("detects duplicated OFX drafts by source id", () => {
  const transactions = parseOfxTransactions(`
    <STMTTRN>
      <DTPOSTED>20260504120000
      <TRNAMT>-40.00
      <FITID>same-id
      <NAME>Uber Trip
    </STMTTRN>
  `);
  const drafts = createOfxDrafts(transactions, [{ source: "ofx", sourceId: "same-id" }], () => "draft-1");

  assert.equal(drafts[0].duplicate, true);
  assert.equal(drafts[0].selected, false);
});

test("suggests obvious categories from transaction text", () => {
  assert.equal(suggestCategory("UBER viagem"), "Transporte");
  assert.equal(suggestCategory("PIX QRS IFOOD COM"), "Alimentação");
  assert.equal(suggestCategory("Texto sem regra"), "Outros");
});

test("validates backup payloads and normalizes imported data", () => {
  const expenses = validateBackup({
    app: "totalizador-gastos-mensais",
    version: 1,
    expenses: [
      {
        name: "Mercado",
        category: "Alimentacao",
        value: "12.5",
        month: "invalido",
      },
    ],
  }, () => "new-id", "2026-05");

  assert.equal(expenses[0].id, "new-id");
  assert.equal(expenses[0].category, "Alimentação");
  assert.equal(expenses[0].month, "2026-05");
  assert.throws(() => validateBackup({ app: "outro", version: 1, expenses: [] }));
});

test("normalizes dates and checks date utilities", () => {
  const today = getCurrentDate();

  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(isValidDate(today), true);
  assert.equal(isValidDate("2026-05-04"), true);
  assert.equal(isValidDate("2026-5-4"), false);
  assert.equal(isValidDate("20260504"), false);
  assert.equal(isValidDate(""), false);
  assert.equal(isValidDate(undefined), false);

  const withDate = normalizeStoredExpense({
    id: "1", name: "Teste", category: "Outros", value: 10, date: "2026-05-04",
  });
  assert.equal(withDate.date, "2026-05-04");

  const withoutDate = normalizeStoredExpense({
    id: "2", name: "Teste", category: "Outros", value: 10,
  });
  assert.equal(withoutDate.date, undefined);

  const invalidDate = normalizeStoredExpense({
    id: "3", name: "Teste", category: "Outros", value: 10, date: "invalido",
  });
  assert.equal(invalidDate.date, undefined);

  const imported = validateBackup({
    app: "totalizador-gastos-mensais",
    version: 1,
    expenses: [{ name: "Mercado", category: "Outros", value: "50", date: "2026-05-04" }],
  }, () => "id-1", "2026-05");
  assert.equal(imported[0].date, "2026-05-04");

  const importedNoDate = validateBackup({
    app: "totalizador-gastos-mensais",
    version: 1,
    expenses: [{ name: "Mercado", category: "Outros", value: "50" }],
  }, () => "id-2", "2026-05");
  assert.equal(importedNoDate[0].date, undefined);
});

test("normalizes stored expenses and merges backups by id", () => {
  assert.equal(normalizeStoredExpense({ id: "1", name: "", value: 10 }), null);
  const storedExpense = normalizeStoredExpense({
    id: 1,
    name: "Uber",
    category: "Transporte",
    value: "20",
    month: "2026-05",
  });

  assert.equal(storedExpense.id, "1");
  assert.equal(storedExpense.name, "Uber");
  assert.equal(storedExpense.category, "Transporte");
  assert.equal(storedExpense.value, 20);
  assert.equal(storedExpense.description, "");
  assert.equal(storedExpense.month, "2026-05");
  assert.equal(typeof storedExpense.createdAt, "string");
  assert.deepEqual(mergeExpenses([{ id: "1", name: "A" }], [{ id: "1", name: "B" }, { id: "2", name: "C" }]), [
    { id: "1", name: "B" },
    { id: "2", name: "C" },
  ]);
});
