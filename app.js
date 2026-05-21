const STORAGE_KEY = "totalizador-gastos:v1";
const BACKUP_VERSION = 1;
const BACKUP_FILENAME = "gastos.gastos.json";

const CATEGORIES = [
  "Moradia",
  "Alimentacao",
  "Transporte",
  "Saude",
  "Educacao",
  "Lazer",
  "Assinaturas",
  "Contas da casa",
  "Compras",
  "Cuidados pessoais",
  "Familia",
  "Pets",
  "Viagens",
  "Impostos e taxas",
  "Outros",
];

const state = {
  expenses: [],
  selectedMonth: getCurrentMonth(),
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
  mergeImportInput: document.querySelector("#mergeImportInput"),
  clearMonthButton: document.querySelector("#clearMonthButton"),
};

init();

function init() {
  populateCategories();
  loadState();
  elements.monthInput.value = state.selectedMonth;
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
    showFeedback("Nao ha gastos para limpar neste mes.");
    return;
  }

  const shouldClear = window.confirm("Remover todos os gastos deste mes?");

  if (!shouldClear) {
    return;
  }

  state.expenses = state.expenses.filter((expense) => expense.month !== state.selectedMonth);
  saveState();
  resetForm();
  render();
  showFeedback("Gastos do mes removidos.");
}

function render() {
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
        <td class="empty-state" colspan="4">Adicione o primeiro gasto para este mes.</td>
      </tr>
    `;
    return;
  }

  elements.expenseTableBody.innerHTML = sortedExpenses.map((expense) => `
    <tr>
      <td>
        <span class="item-title">${escapeHtml(expense.name)}</span>
        ${expense.description ? `<span class="item-description">${escapeHtml(expense.description)}</span>` : ""}
      </td>
      <td>${escapeHtml(expense.category)}</td>
      <td class="numeric">${formatCurrency(expense.value)}</td>
      <td class="actions-cell">
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
    showFeedback(error.message || "Nao foi possivel importar o arquivo.");
  } finally {
    elements.importInput.value = "";
  }
}

function validateBackup(payload) {
  if (!payload || payload.app !== "totalizador-gastos-mensais") {
    throw new Error("Arquivo invalido para este totalizador.");
  }

  if (payload.version !== BACKUP_VERSION) {
    throw new Error("Versao do arquivo nao suportada.");
  }

  if (!Array.isArray(payload.expenses)) {
    throw new Error("Arquivo sem lista de gastos valida.");
  }

  return payload.expenses.map(normalizeImportedExpense);
}

function normalizeImportedExpense(expense) {
  const value = Number(expense.value);
  const category = CATEGORIES.includes(expense.category) ? expense.category : "Outros";
  const month = isValidMonth(expense.month) ? expense.month : getCurrentMonth();
  const name = String(expense.name || "").trim();

  if (!name || !Number.isFinite(value) || value <= 0) {
    throw new Error("O arquivo possui gastos com dados invalidos.");
  }

  return {
    id: expense.id || crypto.randomUUID(),
    name,
    category,
    value,
    description: String(expense.description || "").trim(),
    month,
    createdAt: expense.createdAt || new Date().toISOString(),
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
    category: CATEGORIES.includes(expense.category) ? expense.category : "Outros",
    value,
    description: String(expense.description || ""),
    month: isValidMonth(expense.month) ? expense.month : getCurrentMonth(),
    createdAt: expense.createdAt || new Date().toISOString(),
  };
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

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
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
