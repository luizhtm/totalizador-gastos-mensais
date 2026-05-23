import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfxDrafts,
  formatMoneyInput,
  getCategoryTotals,
  getTopCategory,
  maskMoneyInputValue,
  mergeExpenses,
  normalizeCategoryName,
  normalizeStoredExpense,
  parseMoneyInput,
  parseOfxTransactions,
  sumExpenses,
  suggestCategory,
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
