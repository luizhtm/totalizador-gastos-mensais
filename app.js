const STORAGE_KEY = "totalizador-gastos:v1";
const BACKUP_VERSION = 1;
const BACKUP_FILENAME = "gastos.gastos.json";

const CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Assinaturas",
  "Contas da casa",
  "Compras",
  "Cuidados pessoais",
  "Família",
  "Pets",
  "Viagens",
  "Impostos e taxas",
  "Outros",
];

const LEGACY_CATEGORY_NAMES = {
  Alimentacao: "Alimentação",
  Saude: "Saúde",
  Educacao: "Educação",
  Familia: "Família",
};

const OFX_CATEGORY_RULES = [
  { category: "Transporte", keywords: ["uber", "99", "taxi", "metro", "metrô", "onibus", "ônibus", "combustivel", "combustível", "posto"] },
  { category: "Alimentação", keywords: ["ifood", "mercado", "market", "supermercado", "mercearia", "padaria", "restaurante", "cafe", "café"] },
  { category: "Moradia", keywords: ["aluguel", "condominio", "condomínio"] },
  { category: "Saúde", keywords: ["farmacia", "farmácia", "drogaria", "medico", "médico", "hospital", "clinica", "clínica"] },
  { category: "Assinaturas", keywords: ["netflix", "spotify", "google", "apple", "assinatura", "prime", "disney", "hbo", "max"] },
  { category: "Contas da casa", keywords: ["energia", "luz", "agua", "água", "internet", "telefone", "celular", "gas", "gás"] },
  { category: "Educação", keywords: ["escola", "faculdade", "curso", "alura", "udemy", "educacao", "educação"] },
  { category: "Compras", keywords: ["amazon", "mercado livre", "shopee", "compra", "magazine", "magalu"] },
  { category: "Viagens", keywords: ["hotel", "airbnb", "booking", "passagem", "latam", "gol", "azul"] },
  { category: "Cuidados pessoais", keywords: ["barbearia", "salao", "salão", "cabelo", "academia"] },
  { category: "Pets", keywords: ["pet", "veterinario", "veterinário", "racao", "ração"] },
];

const state = {
  expenses: [],
  selectedMonth: getCurrentMonth(),
  importDrafts: [],
};

const elements = {
  monthInput: document.querySelector("#monthInput"),
  openExpenseDialogButton: document.querySelector("#openExpenseDialogButton"),
  expenseDialog: document.querySelector("#expenseDialog"),
  expenseForm: document.querySelector("#expenseForm"),
  expenseId: document.querySelector("#expenseId"),
  nameInput: document.querySelector("#nameInput"),
  categoryInput: document.querySelector("#categoryInput"),
  valueInput: document.querySelector("#valueInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  formTitle: document.querySelector("#formTitle"),
  submitButton: document.querySelector("#submitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  totalAmount: document.querySelector("#totalAmount"),
  expenseCount: document.querySelector("#expenseCount"),
  topCategory: document.querySelector("#topCategory"),
  feedback: document.querySelector("#feedback"),
  categorySummary: document.querySelector("#categorySummary"),
  categorySummaryHint: document.querySelector("#categorySummaryHint"),
  expenseListHint: document.querySelector("#expenseListHint"),
  expenseTableBody: document.querySelector("#expenseTableBody"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  ofxInput: document.querySelector("#ofxInput"),
  mergeImportInput: document.querySelector("#mergeImportInput"),
  importReviewSection: document.querySelector("#importReviewSection"),
  importReviewHint: document.querySelector("#importReviewHint"),
  importReviewBody: document.querySelector("#importReviewBody"),
  importSelectedSummary: document.querySelector("#importSelectedSummary"),
  confirmOfxImportButton: document.querySelector("#confirmOfxImportButton"),
  cancelOfxImportButton: document.querySelector("#cancelOfxImportButton"),
  clearMonthButton: document.querySelector("#clearMonthButton"),
};

init();

function init() {
  populateCategories();
  loadState();
  renderMonthOptions();
  bindEvents();
  render();
}

function bindEvents() {
  elements.monthInput.addEventListener("change", () => {
    state.selectedMonth = elements.monthInput.value || getCurrentMonth();
    saveState();
    resetForm();
    closeExpenseDialog();
    render();
  });

  elements.openExpenseDialogButton.addEventListener("click", () => {
    resetForm();
    openExpenseDialog();
  });
  elements.expenseForm.addEventListener("submit", handleFormSubmit);
  elements.cancelEditButton.addEventListener("click", closeExpenseDialog);
  elements.closeDialogButton.addEventListener("click", closeExpenseDialog);
  elements.expenseDialog.addEventListener("close", resetForm);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importInput.addEventListener("change", importBackup);
  elements.ofxInput.addEventListener("change", handleOfxImportFile);
  elements.importReviewBody.addEventListener("input", updateImportSelectionSummary);
  elements.importReviewBody.addEventListener("change", updateImportSelectionSummary);
  elements.confirmOfxImportButton.addEventListener("click", confirmOfxImport);
  elements.cancelOfxImportButton.addEventListener("click", clearImportReview);
  elements.clearMonthButton.addEventListener("click", clearSelectedMonth);

  elements.expenseTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
      startEdit(id);
    }

    if (button.dataset.action === "remove") {
      removeExpense(id);
    }
  });
}

function populateCategories() {
  elements.categoryInput.innerHTML = CATEGORIES.map((category) => (
    `<option value="${escapeAttribute(category)}">${category}</option>`
  )).join("");
}

function handleFormSubmit(event) {
  event.preventDefault();

  const expense = readFormExpense();

  if (!expense) {
    showFeedback("Informe um valor maior que zero.");
    return;
  }

  const editingId = elements.expenseId.value;

  if (editingId) {
    state.expenses = state.expenses.map((item) => (
      item.id === editingId ? { ...item, ...expense, id: editingId } : item
    ));
    showFeedback("Gasto atualizado.");
  } else {
    state.expenses.push({
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    showFeedback("Gasto adicionado.");
  }

  saveState();
  resetForm();
  closeExpenseDialog();
  render();
}

function readFormExpense() {
  const value = Number(elements.valueInput.value);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    name: elements.nameInput.value.trim(),
    category: elements.categoryInput.value,
    value,
    description: elements.descriptionInput.value.trim(),
    month: state.selectedMonth,
  };
}

function startEdit(id) {
  const expense = state.expenses.find((item) => item.id === id);

  if (!expense) {
    return;
  }

  state.selectedMonth = expense.month;
  elements.monthInput.value = expense.month;
  elements.expenseId.value = expense.id;
  elements.nameInput.value = expense.name;
  elements.categoryInput.value = expense.category;
  elements.valueInput.value = String(expense.value);
  elements.descriptionInput.value = expense.description || "";
  elements.formTitle.textContent = "Editar gasto";
  elements.submitButton.textContent = "Salvar alteracoes";
  openExpenseDialog();
  elements.nameInput.focus();
  render();
}

function resetForm() {
  elements.expenseForm.reset();
  elements.expenseId.value = "";
  elements.categoryInput.value = CATEGORIES[0];
  elements.formTitle.textContent = "Adicionar gasto";
  elements.submitButton.textContent = "Adicionar";
}

function openExpenseDialog() {
  if (!elements.expenseDialog.open) {
    elements.expenseDialog.showModal();
  }
}

function closeExpenseDialog() {
  if (elements.expenseDialog.open) {
    elements.expenseDialog.close();
  }
}

function removeExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);

  if (!expense) {
    return;
  }

  const shouldRemove = window.confirm(`Remover "${expense.name}"?`);

  if (!shouldRemove) {
    return;
  }

  state.expenses = state.expenses.filter((item) => item.id !== id);
  saveState();
  resetForm();
  render();
  showFeedback("Gasto removido.");
}

function clearSelectedMonth() {
  const monthExpenses = getSelectedMonthExpenses();

  if (monthExpenses.length === 0) {
    showFeedback("Não há gastos para limpar neste mês.");
    return;
  }

  const shouldClear = window.confirm("Remover todos os gastos deste mês?");

  if (!shouldClear) {
    return;
  }

  state.expenses = state.expenses.filter((expense) => expense.month !== state.selectedMonth);
  saveState();
  resetForm();
  render();
  showFeedback("Gastos do mês removidos.");
}

function render() {
  renderMonthOptions();
  const monthExpenses = getSelectedMonthExpenses();
  const total = sumExpenses(monthExpenses);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const topCategory = getTopCategory(categoryTotals);

  elements.totalAmount.textContent = formatCurrency(total);
  elements.expenseCount.textContent = String(monthExpenses.length);
  elements.topCategory.textContent = topCategory ? topCategory.category : "-";
  elements.clearMonthButton.disabled = monthExpenses.length === 0;

  renderCategorySummary(categoryTotals, total);
  renderExpenseTable(monthExpenses);
}

function renderMonthOptions() {
  const months = getAvailableMonths();

  if (!months.includes(state.selectedMonth)) {
    state.selectedMonth = months[0] || getCurrentMonth();
  }

  elements.monthInput.innerHTML = months.map((month) => `
    <option value="${escapeAttribute(month)}" ${month === state.selectedMonth ? "selected" : ""}>
      ${formatMonthLabel(month)}
    </option>
  `).join("");
  elements.monthInput.value = state.selectedMonth;
}

function getAvailableMonths() {
  const months = new Set([getCurrentMonth()]);

  for (const expense of state.expenses) {
    if (isValidMonth(expense.month)) {
      months.add(expense.month);
    }
  }

  return [...months].sort((a, b) => b.localeCompare(a));
}

function renderCategorySummary(categoryTotals, total) {
  const rows = categoryTotals.sort((a, b) => b.total - a.total);
  const hasRows = rows.length > 0;

  elements.categorySummaryHint.hidden = hasRows;
  elements.categorySummary.innerHTML = rows.map((item) => {
    const percentage = total > 0 ? (item.total / total) * 100 : 0;

    return `
      <div class="category-row">
        <div class="category-row-header">
          <strong>${escapeHtml(item.category)}</strong>
          <span>${formatCurrency(item.total)} (${formatPercent(percentage)})</span>
        </div>
        <div class="category-bar" aria-hidden="true">
          <span style="width: ${percentage}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function renderExpenseTable(expenses) {
  const sortedExpenses = [...expenses].sort((a, b) => (
    a.name.localeCompare(b.name, "pt-BR")
  ));
  const hasRows = sortedExpenses.length > 0;

  elements.expenseListHint.hidden = hasRows;

  if (!hasRows) {
    elements.expenseTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="4">Adicione o primeiro gasto para este mês.</td>
      </tr>
    `;
    return;
  }

  elements.expenseTableBody.innerHTML = sortedExpenses.map((expense) => `
    <tr>
      <td data-label="Item">
        <span class="item-title">${escapeHtml(expense.name)}</span>
        ${expense.description ? `<span class="item-description">${escapeHtml(expense.description)}</span>` : ""}
      </td>
      <td data-label="Categoria">${escapeHtml(expense.category)}</td>
      <td class="numeric" data-label="Valor">${formatCurrency(expense.value)}</td>
      <td class="actions-cell" data-label="Ações">
        <div class="row-actions">
          <button class="secondary" type="button" data-action="edit" data-id="${expense.id}">
            Editar
          </button>
          <button class="outline danger-button" type="button" data-action="remove" data-id="${expense.id}">
            Remover
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function getSelectedMonthExpenses() {
  return state.expenses.filter((expense) => expense.month === state.selectedMonth);
}

function getCategoryTotals(expenses) {
  const totals = new Map();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) || 0) + expense.value);
  }

  return [...totals.entries()].map(([category, total]) => ({ category, total }));
}

function getTopCategory(categoryTotals) {
  return categoryTotals.reduce((currentTop, item) => {
    if (!currentTop || item.total > currentTop.total) {
      return item;
    }

    return currentTop;
  }, null);
}

function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.value, 0);
}

function exportBackup() {
  const months = [...new Set(state.expenses.map((expense) => expense.month))].sort();
  const payload = {
    app: "totalizador-gastos-mensais",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    selectedMonth: state.selectedMonth,
    months,
    expenses: state.expenses,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = BACKUP_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
  showFeedback("Arquivo de backup gerado.");
}

async function handleOfxImportFile(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const transactions = parseOfxTransactions(text);
    const drafts = createOfxDrafts(transactions);

    if (drafts.length === 0) {
      clearImportReview();
      showFeedback("Nenhum gasto foi encontrado no arquivo OFX.");
      return;
    }

    state.importDrafts = drafts;
    renderImportReview(transactions.length);
    showFeedback("Revise os gastos extraídos antes de importar.");
  } catch (error) {
    clearImportReview();
    showFeedback(error.message || "Não foi possível importar o arquivo OFX.");
  } finally {
    elements.ofxInput.value = "";
  }
}

function parseOfxTransactions(text) {
  const content = String(text || "").trim();

  if (!content || !/<STMTTRN\b/i.test(content)) {
    throw new Error("Nenhuma transacao OFX foi encontrada.");
  }

  const blocks = content.match(/<STMTTRN\b[^>]*>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN\b|<\/BANKTRANLIST>|<\/CCSTMTRS>|$)/gi) || [];
  const transactions = blocks.map(parseOfxTransactionBlock).filter(Boolean);

  if (transactions.length === 0) {
    throw new Error("Nenhuma transação OFX válida foi encontrada.");
  }

  return transactions;
}

function parseOfxTransactionBlock(block) {
  const date = normalizeOfxDate(readOfxTag(block, "DTPOSTED"));
  const amount = parseOfxAmount(readOfxTag(block, "TRNAMT"));
  const name = cleanOfxText(readOfxTag(block, "NAME"));
  const memo = cleanOfxText(readOfxTag(block, "MEMO"));
  const fitId = cleanOfxText(readOfxTag(block, "FITID"));
  const type = cleanOfxText(readOfxTag(block, "TRNTYPE"));
  const description = name || memo;

  if (!date || !Number.isFinite(amount) || !description) {
    return null;
  }

  return {
    date,
    month: date.slice(0, 7),
    amount,
    name,
    memo,
    fitId,
    type,
    description,
  };
}

function readOfxTag(block, tagName) {
  const tag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const xmlMatch = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));

  if (xmlMatch) {
    return xmlMatch[1];
  }

  const sgmlMatch = block.match(new RegExp(`<${tag}\\b[^>]*>\\s*([^<\\r\\n]+)`, "i"));
  return sgmlMatch ? sgmlMatch[1] : "";
}

function normalizeOfxDate(value) {
  const digits = String(value || "").match(/\d{8}/);

  if (!digits) {
    return "";
  }

  const raw = digits[0];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function parseOfxAmount(value) {
  const normalized = String(value || "").trim().replace(",", ".");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : NaN;
}

function cleanOfxText(value) {
  const parser = document.createElement("textarea");
  parser.innerHTML = String(value || "").trim();

  return parser.value.replace(/\s+/g, " ").trim();
}

function createOfxDrafts(transactions) {
  const existingKeys = getExistingImportKeys();

  return transactions
    .filter((transaction) => transaction.amount < 0)
    .map((transaction) => {
      const value = Math.abs(transaction.amount);
      const sourceKey = createOfxSourceKey(transaction, value);
      const sourceId = transaction.fitId || "";
      const duplicate = Boolean(
        (sourceId && existingKeys.sourceIds.has(sourceId)) ||
        existingKeys.sourceKeys.has(sourceKey)
      );

      return {
        draftId: crypto.randomUUID(),
        selected: !duplicate,
        duplicate,
        date: transaction.date,
        month: transaction.month,
        name: transaction.name || transaction.memo || "Gasto importado",
        description: transaction.memo && transaction.memo !== transaction.name ? transaction.memo : "",
        category: suggestCategory(`${transaction.name} ${transaction.memo}`),
        value,
        source: "ofx",
        sourceId,
        sourceKey,
        sourceData: transaction,
      };
    });
}

function getExistingImportKeys() {
  const sourceIds = new Set();
  const sourceKeys = new Set();

  for (const expense of state.expenses) {
    if (expense.source === "ofx" && expense.sourceId) {
      sourceIds.add(expense.sourceId);
    }

    if (expense.source === "ofx" && expense.sourceKey) {
      sourceKeys.add(expense.sourceKey);
    }
  }

  return { sourceIds, sourceKeys };
}

function createOfxSourceKey(transaction, value) {
  return [
    "ofx",
    transaction.date,
    value.toFixed(2),
    normalizeForMatching(transaction.description),
  ].join(":");
}

function suggestCategory(text) {
  const normalized = normalizeForMatching(text);
  const match = OFX_CATEGORY_RULES.find((rule) => (
    rule.keywords.some((keyword) => normalized.includes(normalizeForMatching(keyword)))
  ));

  return match ? match.category : "Outros";
}

function renderImportReview(transactionCount) {
  const selectedDrafts = state.importDrafts.filter((draft) => draft.selected && !draft.duplicate);
  const duplicateCount = state.importDrafts.filter((draft) => draft.duplicate).length;

  elements.importReviewSection.hidden = false;
  elements.importReviewHint.textContent = [
    `${state.importDrafts.length} gastos encontrados em ${transactionCount} transações OFX.`,
    duplicateCount > 0 ? `${duplicateCount} possíveis duplicados foram desmarcados.` : "",
  ].filter(Boolean).join(" ");
  elements.importReviewBody.innerHTML = state.importDrafts.map(renderImportDraft).join("");
  elements.importReviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
  updateImportSelectionSummary(selectedDrafts);
}

function renderImportDraft(draft) {
  return `
    <article class="import-draft ${draft.duplicate ? "import-draft-duplicate" : ""}" data-draft-id="${draft.draftId}">
      <label class="import-draft-select">
        <input type="checkbox" data-import-field="selected" ${draft.selected ? "checked" : ""} ${draft.duplicate ? "disabled" : ""}>
        <span>${draft.duplicate ? "Ja importado" : "Importar"}</span>
      </label>

      <div class="import-draft-fields">
        <label>
          Data
          <input type="date" data-import-field="date" value="${escapeAttribute(draft.date)}" disabled>
        </label>

        <label>
          Nome
          <input type="text" data-import-field="name" value="${escapeAttribute(draft.name)}" ${draft.duplicate ? "disabled" : ""}>
        </label>

        <label>
          Categoria
          <select data-import-field="category" ${draft.duplicate ? "disabled" : ""}>
            ${renderCategoryOptions(draft.category)}
          </select>
        </label>

        <label>
          Valor
          <input type="number" min="0.01" step="0.01" data-import-field="value" value="${draft.value.toFixed(2)}" ${draft.duplicate ? "disabled" : ""}>
        </label>
      </div>

      ${draft.description ? `<p class="import-draft-description">${escapeHtml(draft.description)}</p>` : ""}
    </article>
  `;
}

function renderCategoryOptions(selectedCategory) {
  return CATEGORIES.map((category) => `
    <option value="${escapeAttribute(category)}" ${category === selectedCategory ? "selected" : ""}>${category}</option>
  `).join("");
}

function updateImportSelectionSummary(precomputedSelectedDrafts) {
  const selectedDrafts = Array.isArray(precomputedSelectedDrafts)
    ? precomputedSelectedDrafts
    : readSelectedImportDrafts({ allowInvalid: true });
  const selectedTotal = sumExpenses(selectedDrafts);

  elements.importSelectedSummary.textContent = `${selectedDrafts.length} selecionados - ${formatCurrency(selectedTotal)}`;
  elements.confirmOfxImportButton.disabled = selectedDrafts.length === 0;
}

function readSelectedImportDrafts({ allowInvalid } = { allowInvalid: false }) {
  const rows = [...elements.importReviewBody.querySelectorAll("[data-draft-id]")];

  return rows.map((row) => {
    const draft = state.importDrafts.find((item) => item.draftId === row.dataset.draftId);
    const selected = row.querySelector('[data-import-field="selected"]')?.checked;

    if (!draft || !selected || draft.duplicate) {
      return null;
    }

    const value = Number(row.querySelector('[data-import-field="value"]')?.value);
    const name = row.querySelector('[data-import-field="name"]')?.value.trim();
    const category = row.querySelector('[data-import-field="category"]')?.value;

    if (!name || !Number.isFinite(value) || value <= 0 || !CATEGORIES.includes(category)) {
      if (allowInvalid) {
        return null;
      }

      throw new Error("Revise os gastos selecionados antes de importar.");
    }

    return {
      ...draft,
      name,
      category,
      value,
    };
  }).filter(Boolean);
}

function confirmOfxImport() {
  try {
    const selectedDrafts = readSelectedImportDrafts();
    const existingKeys = getExistingImportKeys();
    const expensesToImport = [];
    let skipped = 0;

    for (const draft of selectedDrafts) {
      if (
        (draft.sourceId && existingKeys.sourceIds.has(draft.sourceId)) ||
        existingKeys.sourceKeys.has(draft.sourceKey)
      ) {
        skipped += 1;
        continue;
      }

      expensesToImport.push({
        id: crypto.randomUUID(),
        name: draft.name,
        category: draft.category,
        value: draft.value,
        description: draft.description,
        month: draft.month,
        createdAt: new Date().toISOString(),
        source: "ofx",
        sourceId: draft.sourceId,
        sourceKey: draft.sourceKey,
        sourceData: draft.sourceData,
      });

      if (draft.sourceId) {
        existingKeys.sourceIds.add(draft.sourceId);
      }
      existingKeys.sourceKeys.add(draft.sourceKey);
    }

    if (expensesToImport.length === 0) {
      showFeedback(skipped > 0 ? "Todos os gastos selecionados ja haviam sido importados." : "Nenhuma transacao foi selecionada.");
      updateImportSelectionSummary();
      return;
    }

    state.expenses.push(...expensesToImport);
    state.selectedMonth = expensesToImport[0].month;
    elements.monthInput.value = state.selectedMonth;
    saveState();
    clearImportReview();
    render();
    showFeedback(`${expensesToImport.length} gastos importados${skipped ? `; ${skipped} duplicados ignorados` : ""}.`);
  } catch (error) {
    showFeedback(error.message || "Não foi possível concluir a importação.");
  }
}

function clearImportReview() {
  state.importDrafts = [];
  elements.importReviewBody.innerHTML = "";
  elements.importReviewSection.hidden = true;
  elements.importSelectedSummary.textContent = "0 selecionados";
  elements.confirmOfxImportButton.disabled = true;
}

async function importBackup(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const importedExpenses = validateBackup(payload);
    const shouldMerge = elements.mergeImportInput.checked;

    if (!shouldMerge) {
      const shouldReplace = window.confirm("Substituir todos os dados salvos por este arquivo?");

      if (!shouldReplace) {
        return;
      }
    }

    state.expenses = shouldMerge
      ? mergeExpenses(state.expenses, importedExpenses)
      : importedExpenses;
    state.selectedMonth = isValidMonth(payload.selectedMonth)
      ? payload.selectedMonth
      : state.selectedMonth || getCurrentMonth();
    elements.monthInput.value = state.selectedMonth;
    saveState();
    resetForm();
    render();
    showFeedback("Dados importados com sucesso.");
  } catch (error) {
    showFeedback(error.message || "Não foi possível importar o arquivo.");
  } finally {
    elements.importInput.value = "";
  }
}

function validateBackup(payload) {
  if (!payload || payload.app !== "totalizador-gastos-mensais") {
    throw new Error("Arquivo inválido para este totalizador.");
  }

  if (payload.version !== BACKUP_VERSION) {
    throw new Error("Versão do arquivo não suportada.");
  }

  if (!Array.isArray(payload.expenses)) {
    throw new Error("Arquivo sem lista de gastos válida.");
  }

  return payload.expenses.map(normalizeImportedExpense);
}

function normalizeImportedExpense(expense) {
  const value = Number(expense.value);
  const category = normalizeCategoryName(expense.category);
  const month = isValidMonth(expense.month) ? expense.month : getCurrentMonth();
  const name = String(expense.name || "").trim();

  if (!name || !Number.isFinite(value) || value <= 0) {
    throw new Error("O arquivo possui gastos com dados inválidos.");
  }

  return {
    id: expense.id || crypto.randomUUID(),
    name,
    category,
    value,
    description: String(expense.description || "").trim(),
    month,
    createdAt: expense.createdAt || new Date().toISOString(),
    source: expense.source || undefined,
    sourceId: expense.sourceId || undefined,
    sourceKey: expense.sourceKey || undefined,
    sourceData: expense.sourceData || undefined,
  };
}

function mergeExpenses(currentExpenses, importedExpenses) {
  const merged = new Map(currentExpenses.map((expense) => [expense.id, expense]));

  for (const expense of importedExpenses) {
    merged.set(expense.id, expense);
  }

  return [...merged.values()];
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    state.expenses = Array.isArray(parsed.expenses)
      ? parsed.expenses.map(normalizeStoredExpense).filter(Boolean)
      : [];
    state.selectedMonth = isValidMonth(parsed.selectedMonth)
      ? parsed.selectedMonth
      : getCurrentMonth();
  } catch {
    state.expenses = [];
    state.selectedMonth = getCurrentMonth();
  }
}

function normalizeStoredExpense(expense) {
  const value = Number(expense.value);

  if (!expense.id || !expense.name || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    id: String(expense.id),
    name: String(expense.name),
    category: normalizeCategoryName(expense.category),
    value,
    description: String(expense.description || ""),
    month: isValidMonth(expense.month) ? expense.month : getCurrentMonth(),
    createdAt: expense.createdAt || new Date().toISOString(),
    source: expense.source || undefined,
    sourceId: expense.sourceId || undefined,
    sourceKey: expense.sourceKey || undefined,
    sourceData: expense.sourceData || undefined,
  };
}

function normalizeCategoryName(category) {
  const value = String(category || "");

  if (CATEGORIES.includes(value)) {
    return value;
  }

  return LEGACY_CATEGORY_NAMES[value] || "Outros";
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedMonth: state.selectedMonth,
    expenses: state.expenses,
  }));
}

function showFeedback(message) {
  elements.feedback.textContent = message;
  window.clearTimeout(showFeedback.timeout);
  showFeedback.timeout = window.setTimeout(() => {
    elements.feedback.textContent = "";
  }, 3600);
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function isValidMonth(value) {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value);
}

function formatMonthLabel(value) {
  if (!isValidMonth(value)) {
    return value;
  }

  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function normalizeForMatching(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
