import {
  BACKUP_VERSION,
  CATEGORIES,
  createOfxDrafts,
  formatCurrency,
  formatMoneyInput,
  formatMonthLabel,
  formatPercent,
  getCategoryTotals,
  getCurrentMonth,
  getExistingImportKeys,
  getTopCategory,
  isValidMonth,
  maskMoneyInputValue,
  mergeExpenses,
  normalizeStoredExpense,
  parseMoneyInput,
  parseOfxTransactions,
  sortExpenses,
  sumExpenses,
  validateBackup,
} from "./app-core.js";

const STORAGE_KEY = "totalizador-gastos:v1";
const BACKUP_FILENAME = "gastos.gastos.json";

const state = {
  expenses: [],
  selectedMonth: getCurrentMonth(),
  importDrafts: [],
  expenseSort: {
    field: "name",
    direction: "asc",
  },
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
  expenseSortControls: document.querySelector("#expenseSortControls"),
  expenseSortField: document.querySelector("#expenseSortField"),
  expenseSortDirectionButton: document.querySelector("#expenseSortDirectionButton"),
  expenseTableBody: document.querySelector("#expenseTableBody"),
  expenseTableHead: document.querySelector("#expenseTableHead"),
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
  elements.valueInput.addEventListener("input", maskValueInput);
  elements.valueInput.addEventListener("blur", normalizeValueInput);
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
  elements.expenseSortField.addEventListener("change", () => {
    setExpenseSort(elements.expenseSortField.value);
  });
  elements.expenseSortDirectionButton.addEventListener("click", () => {
    state.expenseSort.direction = state.expenseSort.direction === "asc" ? "desc" : "asc";
    render();
  });
  elements.expenseTableHead.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-sort-field]");

    if (!button) {
      return;
    }

    setExpenseSort(button.dataset.sortField);
  });

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

function setExpenseSort(field) {
  if (!["name", "category", "value"].includes(field)) {
    return;
  }

  if (state.expenseSort.field === field) {
    state.expenseSort.direction = state.expenseSort.direction === "asc" ? "desc" : "asc";
  } else {
    state.expenseSort.field = field;
    state.expenseSort.direction = "asc";
  }

  render();
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
  const value = parseMoneyInput(elements.valueInput.value);

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
  elements.valueInput.value = formatMoneyInput(expense.value);
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
  elements.valueInput.value = "";
  elements.categoryInput.value = CATEGORIES[0];
  elements.formTitle.textContent = "Adicionar gasto";
  elements.submitButton.textContent = "Adicionar";
}

function maskValueInput() {
  elements.valueInput.value = maskMoneyInputValue(elements.valueInput.value);
}

function normalizeValueInput() {
  const value = parseMoneyInput(elements.valueInput.value);

  elements.valueInput.value = Number.isFinite(value) && value > 0
    ? formatMoneyInput(value)
    : "";
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

  renderExpenseSortControls();
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

function renderExpenseSortControls() {
  const directionLabel = state.expenseSort.direction === "asc" ? "Crescente" : "Decrescente";
  const directionIcon = state.expenseSort.direction === "asc" ? "↑" : "↓";

  elements.expenseSortField.value = state.expenseSort.field;
  elements.expenseSortDirectionButton.textContent = directionLabel;
  elements.expenseSortDirectionButton.setAttribute("aria-label", `Ordenação ${directionLabel.toLowerCase()}`);

  for (const button of elements.expenseTableHead.querySelectorAll("[data-sort-field]")) {
    const isActive = button.dataset.sortField === state.expenseSort.field;
    const indicator = button.querySelector("[data-sort-indicator]");
    const th = button.closest("th");

    button.setAttribute("aria-pressed", String(isActive));
    if (indicator) {
      indicator.textContent = isActive ? directionIcon : "↕";
    }
    if (th) {
      th.setAttribute(
        "aria-sort",
        isActive ? (state.expenseSort.direction === "asc" ? "ascending" : "descending") : "none",
      );
    }
  }
}

function renderExpenseTable(expenses) {
  const sortedExpenses = sortExpenses(expenses, state.expenseSort);
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
          <button class="secondary icon-action icon-action-edit" type="button" data-action="edit" data-id="${expense.id}" aria-label="Editar gasto ${escapeAttribute(expense.name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 20h9"/>
              <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"/>
            </svg>
            <span>Editar</span>
          </button>
          <button class="outline danger-button icon-action icon-action-remove" type="button" data-action="remove" data-id="${expense.id}" aria-label="Remover gasto ${escapeAttribute(expense.name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 6h18"/>
              <path d="M8 6V4h8v2"/>
              <path d="M19 6 18 20H6L5 6"/>
              <path d="M10 11v5"/>
              <path d="M14 11v5"/>
            </svg>
            <span>Remover</span>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function getSelectedMonthExpenses() {
  return state.expenses.filter((expense) => expense.month === state.selectedMonth);
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
    const drafts = createOfxDrafts(transactions, state.expenses);

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
    const existingKeys = getExistingImportKeys(state.expenses);
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
