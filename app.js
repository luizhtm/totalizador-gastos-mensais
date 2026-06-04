import {
  BACKUP_VERSION,
  CATEGORIES,
  createOfxDrafts,
  formatCurrency,
  formatMoneyInput,
  formatMonthLabel,
  formatPercent,
  getCategoryTotals,
  getCurrentDate,
  getCurrentMonth,
  getExistingImportKeys,
  getMonthlyComparison,
  getTopCategory,
  isValidDate,
  isValidMonth,
  maskMoneyInputValue,
  mergeExpenses,
  normalizeThemeMode,
  normalizeStoredExpense,
  parseMoneyInput,
  parseOfxTransactions,
  removeExpensesByIds,
  resolveThemeMode,
  sortExpenses,
  sumExpenses,
  updateExpenseCategoryByIds,
  validateBackup,
} from "./app-core.js";

const STORAGE_KEY = "totalizador-gastos:v1";
const THEME_STORAGE_KEY = "totalizador-gastos:theme-mode";
const BACKUP_FILE_EXTENSION = ".gastos.json";

const state = {
  expenses: [],
  selectedMonth: getCurrentMonth(),
  importDrafts: [],
  themeMode: "auto",
  installPromptEvent: null,
  expenseSort: {
    field: "name",
    direction: "asc",
  },
  selectedExpenseIds: new Set(),
  showComparison: false,
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
  dateInput: document.querySelector("#dateInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  formTitle: document.querySelector("#formTitle"),
  submitButton: document.querySelector("#submitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  totalAmount: document.querySelector("#totalAmount"),
  expenseCount: document.querySelector("#expenseCount"),
  topCategory: document.querySelector("#topCategory"),
  feedback: document.querySelector("#feedback"),
  installAppButton: document.querySelector("#installAppButton"),
  categorySummary: document.querySelector("#categorySummary"),
  categorySummaryHint: document.querySelector("#categorySummaryHint"),
  expenseListHint: document.querySelector("#expenseListHint"),
  expenseSortControls: document.querySelector("#expenseSortControls"),
  expenseSortField: document.querySelector("#expenseSortField"),
  expenseSortDirectionButton: document.querySelector("#expenseSortDirectionButton"),
  expenseTableBody: document.querySelector("#expenseTableBody"),
  expenseTableHead: document.querySelector("#expenseTableHead"),
  selectAllRowsInput: document.querySelector("#selectAllRowsInput"),
  mobileSelectAllControl: document.querySelector("#mobileSelectAllControl"),
  mobileSelectAllRowsInput: document.querySelector("#mobileSelectAllRowsInput"),
  mobileSelectAllLabel: document.querySelector("#mobileSelectAllLabel"),
  expenseListHeading: document.querySelector("#expenseListHeading"),
  bulkActionBar: document.querySelector("#bulkActionBar"),
  bulkSelectionSummary: document.querySelector("#bulkSelectionSummary"),
  bulkCategoryInput: document.querySelector("#bulkCategoryInput"),
  applyBulkCategoryButton: document.querySelector("#applyBulkCategoryButton"),
  removeSelectedExpensesButton: document.querySelector("#removeSelectedExpensesButton"),
  exportButton: document.querySelector("#exportButton"),
  comparisonCTA: document.querySelector("#comparisonCTA"),
  comparisonToggleButton: document.querySelector("#comparisonToggleButton"),
  comparisonSection: document.querySelector("#comparisonSection"),
  comparisonTableHead: document.querySelector("#comparisonTableHead"),
  comparisonTableBody: document.querySelector("#comparisonTableBody"),
  comparisonEmpty: document.querySelector("#comparisonEmpty"),
  importInput: document.querySelector("#importInput"),
  ofxInput: document.querySelector("#ofxInput"),
  mergeImportInput: document.querySelector("#mergeImportInput"),
  importReviewSection: document.querySelector("#importReviewSection"),
  importReviewHint: document.querySelector("#importReviewHint"),
  importReviewBody: document.querySelector("#importReviewBody"),
  importSelectedSummary: document.querySelector("#importSelectedSummary"),
  confirmOfxImportButton: document.querySelector("#confirmOfxImportButton"),
  cancelOfxImportButton: document.querySelector("#cancelOfxImportButton"),
  themeModeButtons: document.querySelectorAll("[data-theme-mode]"),
};

init();

function init() {
  loadThemeMode();
  applyThemeMode();
  populateCategories();
  loadState();
  renderMonthOptions();
  bindEvents();
  render();
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Offline support is optional; the app remains usable as a normal static page.
    });
  });
}

function bindEvents() {
  elements.monthInput.addEventListener("change", () => {
    state.selectedMonth = elements.monthInput.value || getCurrentMonth();
    clearExpenseSelection();
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
  elements.nameInput.addEventListener("keydown", handleNameInputKeydown);
  elements.nameInput.addEventListener("input", updateFormSubmitState);
  elements.categoryInput.addEventListener("change", updateFormSubmitState);
  elements.descriptionInput.addEventListener("keydown", handleDescriptionInputKeydown);
  elements.descriptionInput.addEventListener("input", updateFormSubmitState);
  elements.valueInput.addEventListener("keydown", handleValueInputKeydown);
  elements.valueInput.addEventListener("input", () => {
    maskValueInput();
    updateFormSubmitState();
  });
  elements.valueInput.addEventListener("blur", () => {
    normalizeValueInput();
    updateFormSubmitState();
  });
  elements.cancelEditButton.addEventListener("click", closeExpenseDialog);
  elements.closeDialogButton.addEventListener("click", closeExpenseDialog);
  elements.expenseDialog.addEventListener("close", resetForm);
  elements.comparisonToggleButton.addEventListener("click", toggleComparison);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importInput.addEventListener("change", importBackup);
  elements.ofxInput.addEventListener("change", handleOfxImportFile);
  elements.importReviewBody.addEventListener("input", handleImportReviewSummaryChange);
  elements.importReviewBody.addEventListener("change", handleImportReviewSummaryChange);
  elements.confirmOfxImportButton.addEventListener("click", confirmOfxImport);
  elements.cancelOfxImportButton.addEventListener("click", clearImportReview);
  elements.bulkCategoryInput.addEventListener("change", renderBulkCategoryActionState);
  elements.applyBulkCategoryButton.addEventListener("click", applyBulkCategory);
  elements.removeSelectedExpensesButton.addEventListener("click", removeSelectedExpenses);
  elements.selectAllRowsInput.addEventListener("change", () => {
    setAllExpensesSelection(elements.selectAllRowsInput.checked);
  });
  elements.mobileSelectAllRowsInput.addEventListener("change", () => {
    setAllExpensesSelection(elements.mobileSelectAllRowsInput.checked);
  });
  elements.installAppButton.addEventListener("click", installApp);
  for (const button of elements.themeModeButtons) {
    button.addEventListener("click", () => {
      setThemeMode(button.dataset.themeMode);
    });
  }
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
  elements.expenseTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[data-select-expense]");

    if (!checkbox) {
      return;
    }

    setExpenseSelection(checkbox.dataset.id, checkbox.checked);
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPromptEvent = event;
    renderInstallAppButton();
  });
  window.addEventListener("appinstalled", () => {
    state.installPromptEvent = null;
    renderInstallAppButton();
  });
}

function handleNameInputKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  elements.categoryInput.focus();
}

function handleValueInputKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  normalizeValueInput();
  updateFormSubmitState();

  if (!elements.nameInput.value.trim()) {
    elements.nameInput.focus();
    return;
  }

  if (!elements.categoryInput.value) {
    elements.categoryInput.focus();
    return;
  }

  if (!elements.valueInput.value || elements.submitButton.disabled) {
    elements.descriptionInput.focus();
    return;
  }

  elements.expenseForm.requestSubmit();
}

function handleDescriptionInputKeydown(event) {
  if (event.key !== "Enter" || (!event.ctrlKey && !event.metaKey)) {
    return;
  }

  event.preventDefault();

  if (!elements.submitButton.disabled) {
    elements.expenseForm.requestSubmit();
  }
}

async function installApp() {
  if (!state.installPromptEvent) {
    return;
  }

  const promptEvent = state.installPromptEvent;
  state.installPromptEvent = null;
  renderInstallAppButton();

  await promptEvent.prompt();
  await promptEvent.userChoice.catch(() => null);
}

function renderInstallAppButton() {
  const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || false;
  elements.installAppButton.hidden = isStandalone || !state.installPromptEvent;
}

function setThemeMode(mode) {
  state.themeMode = normalizeThemeMode(mode);
  localStorage.setItem(THEME_STORAGE_KEY, state.themeMode);
  applyThemeMode();
}

function loadThemeMode() {
  state.themeMode = normalizeThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
}

function applyThemeMode() {
  const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
  const activeTheme = resolveThemeMode(state.themeMode, systemPrefersDark);
  const themeColor = activeTheme === "dark" ? "#0f172a" : "#2563eb";

  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.dataset.themeMode = state.themeMode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);

  for (const button of elements.themeModeButtons) {
    const isActive = button.dataset.themeMode === state.themeMode;
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function setExpenseSort(field) {
  if (!["name", "category", "value", "date"].includes(field)) {
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

function toggleComparison() {
  state.showComparison = !state.showComparison;
  render();
}

function updateComparisonCTA() {
  const months = new Set(state.expenses.map((e) => e.month));
  elements.comparisonCTA.hidden = months.size < 2;
}

function populateCategories() {
  elements.categoryInput.innerHTML = [
    '<option value="" disabled selected>Selecione uma categoria</option>',
    ...CATEGORIES.map((category) => (
      `<option value="${escapeAttribute(category)}">${category}</option>`
    )),
  ].join("");
  elements.bulkCategoryInput.innerHTML = [
    '<option value="" disabled selected>Selecione uma categoria</option>',
    ...CATEGORIES.map((category) => (
      `<option value="${escapeAttribute(category)}">${category}</option>`
    )),
  ].join("");
}

function handleFormSubmit(event) {
  event.preventDefault();

  const expense = readFormExpense();

  if (!expense) {
    showFeedback("Preencha nome do item, categoria e valor maior que zero.", "warning");
    return;
  }

  const editingId = elements.expenseId.value;

  if (editingId) {
    state.expenses = state.expenses.map((item) => (
      item.id === editingId ? { ...item, ...expense, id: editingId } : item
    ));
    showFeedback("Gasto atualizado.", "success");
  } else {
    state.expenses.push({
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    showFeedback("Gasto adicionado.", "success");
  }

  saveState();
  resetForm();
  closeExpenseDialog();
  render();
}

function readFormExpense() {
  const value = parseMoneyInput(elements.valueInput.value);
  const name = elements.nameInput.value.trim();
  const category = elements.categoryInput.value;

  if (!name || !category || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const date = isValidDate(elements.dateInput.value) ? elements.dateInput.value : getCurrentDate();

  return {
    name,
    category,
    value,
    date,
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
  elements.dateInput.value = isValidDate(expense.date) ? expense.date : "";
  elements.descriptionInput.value = expense.description || "";
  elements.formTitle.textContent = "Editar gasto";
  elements.submitButton.textContent = "Salvar alterações";
  updateFormSubmitState();
  openExpenseDialog();
  render();
}

function resetForm() {
  elements.expenseForm.reset();
  elements.expenseId.value = "";
  elements.valueInput.value = "";
  elements.categoryInput.value = "";
  elements.dateInput.value = getCurrentDate();
  elements.formTitle.textContent = "Adicionar gasto";
  elements.submitButton.textContent = "Adicionar";
  updateFormSubmitState();
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

function updateFormSubmitState() {
  const draft = readFormExpense();

  if (!draft) {
    elements.submitButton.disabled = true;
    return;
  }

  const editingId = elements.expenseId.value;

  if (!editingId) {
    elements.submitButton.disabled = false;
    return;
  }

  const originalExpense = state.expenses.find((expense) => expense.id === editingId);

  if (!originalExpense) {
    elements.submitButton.disabled = true;
    return;
  }

  elements.submitButton.disabled = !hasExpenseChanged(originalExpense, draft);
}

function hasExpenseChanged(originalExpense, draft) {
  return originalExpense.name !== draft.name
    || originalExpense.category !== draft.category
    || originalExpense.value !== draft.value
    || (originalExpense.description || "") !== draft.description;
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
  showFeedback("Gasto removido.", "success");
}

function setExpenseSelection(id, selected) {
  if (selected) {
    state.selectedExpenseIds.add(id);
  } else {
    state.selectedExpenseIds.delete(id);
  }

  render();
}

function clearExpenseSelection() {
  state.selectedExpenseIds.clear();
}

function pruneExpenseSelection(monthExpenses) {
  const currentIds = new Set(monthExpenses.map((expense) => expense.id));

  for (const id of state.selectedExpenseIds) {
    if (!currentIds.has(id)) {
      state.selectedExpenseIds.delete(id);
    }
  }
}

function setAllExpensesSelection(selected) {
  if (selected) {
    for (const expense of getSelectedMonthExpenses()) {
      state.selectedExpenseIds.add(expense.id);
    }
  } else {
    clearExpenseSelection();
  }
  render();
}

function applyBulkCategory() {
  const selectedIds = [...state.selectedExpenseIds];
  const category = elements.bulkCategoryInput.value;

  if (selectedIds.length === 0) {
    return;
  }

  if (!category) {
    showFeedback("Selecione uma categoria para alterar os gastos.", "warning");
    return;
  }

  const shouldApply = window.confirm(
    `Alterar ${selectedIds.length} gastos selecionados para a categoria "${category}"?`
  );

  if (!shouldApply) {
    return;
  }

  state.expenses = updateExpenseCategoryByIds(state.expenses, selectedIds, category);
  saveState();
  clearExpenseSelection();
  elements.bulkCategoryInput.value = "";
  resetForm();
  render();
  showFeedback(`${selectedIds.length} gastos atualizados.`, "success");
}

function removeSelectedExpenses() {
  const selectedIds = [...state.selectedExpenseIds];

  if (selectedIds.length === 0) {
    return;
  }

  const shouldRemove = window.confirm(`Remover ${selectedIds.length} gastos selecionados?`);

  if (!shouldRemove) {
    return;
  }

  state.expenses = removeExpensesByIds(state.expenses, selectedIds);
  saveState();
  clearExpenseSelection();
  resetForm();
  render();
  showFeedback(`${selectedIds.length} gastos removidos.`, "success");
}

function render() {
  renderMonthOptions();
  const monthExpenses = getSelectedMonthExpenses();
  pruneExpenseSelection(monthExpenses);
  const total = sumExpenses(monthExpenses);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const topCategory = getTopCategory(categoryTotals);

  elements.totalAmount.textContent = formatCurrency(total);
  elements.expenseCount.textContent = String(monthExpenses.length);
  elements.topCategory.textContent = topCategory ? topCategory.category : "-";

  renderExpenseSortControls();
  renderBulkActions(monthExpenses);
  renderCategorySummary(categoryTotals, total);
  renderExpenseTable(monthExpenses);
  renderComparison();
  updateComparisonCTA();
}

function renderBulkActions(monthExpenses) {
  const selectedCount = state.selectedExpenseIds.size;
  const hasRows = monthExpenses.length > 0;
  const hasSelection = selectedCount > 0;
  const allSelected = hasRows && selectedCount === monthExpenses.length;

  elements.bulkActionBar.hidden = !hasSelection;
  elements.bulkActionBar.classList.toggle("bulk-action-bar-sticky", hasSelection);
  elements.feedback.classList.toggle("toast-region-raised", hasSelection);
  if (!hasSelection) {
    elements.bulkCategoryInput.value = "";
  }
  elements.bulkSelectionSummary.hidden = !hasSelection;
  elements.bulkCategoryInput.hidden = !hasSelection;
  elements.applyBulkCategoryButton.hidden = !hasSelection;
  elements.removeSelectedExpensesButton.hidden = !hasSelection;
  elements.bulkSelectionSummary.textContent = selectedCount === 1
    ? "1 selecionado"
    : `${selectedCount} selecionados`;
  elements.selectAllRowsInput.disabled = !hasRows;
  elements.selectAllRowsInput.checked = allSelected;
  elements.selectAllRowsInput.indeterminate = hasSelection && !allSelected;
  elements.mobileSelectAllControl.hidden = !hasRows;
  elements.mobileSelectAllRowsInput.disabled = !hasRows;
  elements.mobileSelectAllRowsInput.checked = allSelected;
  elements.mobileSelectAllRowsInput.indeterminate = hasSelection && !allSelected;
  elements.mobileSelectAllLabel.textContent = allSelected
    ? "Todos selecionados"
    : hasSelection ? "Alguns selecionados" : "Selecionar todos";
  renderBulkCategoryActionState();
}

function renderBulkCategoryActionState() {
  elements.applyBulkCategoryButton.disabled = !elements.bulkCategoryInput.value;
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
        <td class="empty-state" colspan="6">Adicione o primeiro gasto para este mês.</td>
      </tr>
    `;
    return;
  }

  const hasSelection = state.selectedExpenseIds.size > 0;
  const disabledEditTitle = "Cancele a seleção para editar este gasto.";
  const disabledRemoveTitle = "Cancele a seleção para remover este gasto.";

  elements.expenseTableBody.innerHTML = sortedExpenses.map((expense) => `
    <tr class="${state.selectedExpenseIds.has(expense.id) ? "expense-row-selected" : ""}">
      <td class="selection-cell" data-label="Selecionar">
        <label class="expense-select">
          <input type="checkbox" data-select-expense data-id="${expense.id}" ${state.selectedExpenseIds.has(expense.id) ? "checked" : ""}>
          <span>Selecionar</span>
        </label>
      </td>
      <td class="item-cell" data-label="Item">
        <span class="item-title">${escapeHtml(expense.name)}</span>
        ${expense.description ? `<span class="item-description">${escapeHtml(expense.description)}</span>` : ""}
      </td>
      <td class="date-cell" data-label="Data">${expense.date ? `<span title="${expense.date.split("-").reverse().join("/")}">${expense.date.split("-").slice(1).reverse().join("/")}</span>` : "—"}</td>
      <td class="category-cell" data-label="Categoria">${escapeHtml(expense.category)}</td>
      <td class="numeric value-cell" data-label="Valor">${formatCurrency(expense.value)}</td>
      <td class="actions-cell" data-label="Ações">
        <div class="row-actions">
          <button class="secondary icon-action icon-action-edit" type="button" data-action="edit" data-id="${expense.id}" ${hasSelection ? "disabled" : ""} title="${hasSelection ? disabledEditTitle : `Editar gasto ${escapeAttribute(expense.name)}`}" aria-label="${hasSelection ? disabledEditTitle : `Editar gasto ${escapeAttribute(expense.name)}`}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 20h9"/>
              <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"/>
            </svg>
            <span>Editar</span>
          </button>
          <button class="outline danger-button icon-action icon-action-remove" type="button" data-action="remove" data-id="${expense.id}" ${hasSelection ? "disabled" : ""} title="${hasSelection ? disabledRemoveTitle : `Remover gasto ${escapeAttribute(expense.name)}`}" aria-label="${hasSelection ? disabledRemoveTitle : `Remover gasto ${escapeAttribute(expense.name)}`}">
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

function renderComparison() {
  const isVisible = state.showComparison && state.expenses.length > 0;

  elements.comparisonSection.hidden = !state.showComparison;
  elements.comparisonEmpty.hidden = state.expenses.length > 0;

  if (!isVisible) {
    return;
  }

  const { months, rows: categoryRows, monthTotals } = getMonthlyComparison(state.expenses);

  elements.comparisonTableHead.innerHTML = `
    <tr>
      <th class="comparison-category-cell">Categoria</th>
      ${months.map((month) => `<th class="comparison-month-cell numeric">${formatMonthLabel(month)}</th>`).join("")}
    </tr>
  `;

  let rows = categoryRows.map(({ category, values }) => {
    return `
      <tr>
        <td class="comparison-category-cell">${category}</td>
        ${values.map((value) => `
          <td class="numeric comparison-value-cell">${value > 0 ? formatCurrency(value) : "—"}</td>
        `).join("")}
      </tr>
    `;
  }).join("");

  rows += `
    <tr class="comparison-total-row">
      <td class="comparison-category-cell">Total</td>
      ${months.map((month) => `<td class="numeric comparison-value-cell">${formatCurrency(monthTotals.get(month))}</td>`).join("")}
    </tr>
  `;

  elements.comparisonTableBody.innerHTML = rows;
}

function getSelectedMonthExpenses() {
  return state.expenses.filter((expense) => expense.month === state.selectedMonth);
}

function exportBackup() {
  const exportedAt = new Date();
  const months = [...new Set(state.expenses.map((expense) => expense.month))].sort();
  const payload = {
    app: "totalizador-gastos-mensais",
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
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
  link.download = `${formatBackupTimestamp(exportedAt)}${BACKUP_FILE_EXTENSION}`;
  link.click();
  URL.revokeObjectURL(url);
  showFeedback("Arquivo de backup gerado.", "success");
}

function formatBackupTimestamp(date) {
  return date.toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[:]/g, "-");
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
      showFeedback("Nenhum gasto foi encontrado no arquivo OFX.", "warning");
      return;
    }

    state.importDrafts = drafts;
    renderImportReview(transactions.length);
    showFeedback("Revise os gastos extraídos antes de importar.", "info");
  } catch (error) {
    clearImportReview();
    showFeedback(error.message || "Não foi possível importar o arquivo OFX.", "warning");
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

function handleImportReviewSummaryChange(event) {
  const field = event.target.closest("[data-import-field]")?.dataset.importField;

  if (["name", "selected", "value"].includes(field)) {
    updateImportSelectionSummary();
  }
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
        date: isValidDate(draft.date) ? draft.date : undefined,
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
      showFeedback(skipped > 0 ? "Todos os gastos selecionados ja haviam sido importados." : "Nenhuma transacao foi selecionada.", "warning");
      updateImportSelectionSummary();
      return;
    }

    state.expenses.push(...expensesToImport);
    state.selectedMonth = expensesToImport[0].month;
    elements.monthInput.value = state.selectedMonth;
    clearExpenseSelection();
    saveState();
    clearImportReview();
    render();
    showFeedback(`${expensesToImport.length} gastos importados${skipped ? `; ${skipped} duplicados ignorados` : ""}.`, "success");
  } catch (error) {
    showFeedback(error.message || "Não foi possível concluir a importação.", "warning");
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
    clearExpenseSelection();
    saveState();
    resetForm();
    render();
    showFeedback("Dados importados com sucesso.", "success");
  } catch (error) {
    showFeedback(error.message || "Não foi possível importar o arquivo.", "warning");
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

function showFeedback(message, type = "info") {
  const toast = document.createElement("div");
  const closeButton = document.createElement("button");

  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  closeButton.className = "toast-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Fechar notificação");
  closeButton.textContent = "X";
  toast.append(closeButton);

  while (elements.feedback.children.length >= 2) {
    elements.feedback.firstElementChild.remove();
  }

  elements.feedback.append(toast);

  const dismissToast = () => {
    toast.classList.add("toast-hiding");
    window.setTimeout(() => toast.remove(), 180);
  };
  const timeoutId = window.setTimeout(dismissToast, 4200);

  closeButton.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    dismissToast();
  });
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
