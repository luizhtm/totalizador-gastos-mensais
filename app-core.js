import { OFX_CATEGORY_RULES } from "./ofx-category-rules.js";

export const BACKUP_VERSION = 1;

export const THEME_MODES = ["auto", "light", "dark"];

export const CATEGORIES = [
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

export const LEGACY_CATEGORY_NAMES = {
  Alimentacao: "Alimentação",
  Saude: "Saúde",
  Educacao: "Educação",
  Familia: "Família",
};

export function getCategoryTotals(expenses) {
  const totals = new Map();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) || 0) + expense.value);
  }

  return [...totals.entries()].map(([category, total]) => ({ category, total }));
}

export function getTopCategory(categoryTotals) {
  return categoryTotals.reduce((currentTop, item) => {
    if (!currentTop || item.total > currentTop.total) {
      return item;
    }

    return currentTop;
  }, null);
}

export function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.value, 0);
}

export function normalizeThemeMode(mode) {
  return THEME_MODES.includes(mode) ? mode : "auto";
}

export function resolveThemeMode(mode, systemPrefersDark) {
  const normalizedMode = normalizeThemeMode(mode);

  if (normalizedMode === "auto") {
    return systemPrefersDark ? "dark" : "light";
  }

  return normalizedMode;
}

export function sortExpenses(expenses, sort = { field: "name", direction: "asc" }) {
  const field = ["name", "category", "value"].includes(sort.field) ? sort.field : "name";
  const direction = sort.direction === "desc" ? "desc" : "asc";
  const directionFactor = direction === "desc" ? -1 : 1;

  return [...expenses].sort((a, b) => {
    const primaryComparison = compareExpenseField(a, b, field);

    if (primaryComparison !== 0) {
      return primaryComparison * directionFactor;
    }

    return compareExpenseField(a, b, "name");
  });
}

export function updateExpenseCategoryByIds(expenses, ids, category) {
  const selectedIds = new Set(ids);

  if (!CATEGORIES.includes(category) || selectedIds.size === 0) {
    return expenses;
  }

  return expenses.map((expense) => (
    selectedIds.has(expense.id) ? { ...expense, category } : expense
  ));
}

export function removeExpensesByIds(expenses, ids) {
  const selectedIds = new Set(ids);

  if (selectedIds.size === 0) {
    return expenses;
  }

  return expenses.filter((expense) => !selectedIds.has(expense.id));
}

function compareExpenseField(a, b, field) {
  if (field === "value") {
    return a.value - b.value;
  }

  return String(a[field] || "").localeCompare(String(b[field] || ""), "pt-BR", {
    sensitivity: "base",
  });
}

export function parseOfxTransactions(text) {
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

export function parseOfxTransactionBlock(block) {
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

export function readOfxTag(block, tagName) {
  const tag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const xmlMatch = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));

  if (xmlMatch) {
    return xmlMatch[1];
  }

  const sgmlMatch = block.match(new RegExp(`<${tag}\\b[^>]*>\\s*([^<\\r\\n]+)`, "i"));
  return sgmlMatch ? sgmlMatch[1] : "";
}

export function normalizeOfxDate(value) {
  const digits = String(value || "").match(/\d{8}/);

  if (!digits) {
    return "";
  }

  const raw = digits[0];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

export function parseOfxAmount(value) {
  const normalized = String(value || "").trim().replace(",", ".");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : NaN;
}

export function cleanOfxText(value) {
  return decodeHtmlEntities(String(value || "").trim()).replace(/\s+/g, " ").trim();
}

export function createOfxDrafts(transactions, existingExpenses = [], createId = randomId) {
  const existingKeys = getExistingImportKeys(existingExpenses);

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
        draftId: createId(),
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

export function getExistingImportKeys(expenses) {
  const sourceIds = new Set();
  const sourceKeys = new Set();

  for (const expense of expenses) {
    if (expense.source === "ofx" && expense.sourceId) {
      sourceIds.add(expense.sourceId);
    }

    if (expense.source === "ofx" && expense.sourceKey) {
      sourceKeys.add(expense.sourceKey);
    }
  }

  return { sourceIds, sourceKeys };
}

export function createOfxSourceKey(transaction, value) {
  return [
    "ofx",
    transaction.date,
    value.toFixed(2),
    normalizeForMatching(transaction.description),
  ].join(":");
}

export function suggestCategory(text) {
  const normalized = normalizeForMatching(text);
  const match = OFX_CATEGORY_RULES.find((rule) => (
    rule.keywords.some((keyword) => normalized.includes(normalizeForMatching(keyword)))
  ));

  return match ? match.category : "Outros";
}

export function validateBackup(payload, createId = randomId, currentMonth = getCurrentMonth()) {
  if (!payload || payload.app !== "totalizador-gastos-mensais") {
    throw new Error("Arquivo inválido para este totalizador.");
  }

  if (payload.version !== BACKUP_VERSION) {
    throw new Error("Versão do arquivo não suportada.");
  }

  if (!Array.isArray(payload.expenses)) {
    throw new Error("Arquivo sem lista de gastos válida.");
  }

  return payload.expenses.map((expense) => normalizeImportedExpense(expense, createId, currentMonth));
}

export function normalizeImportedExpense(expense, createId = randomId, currentMonth = getCurrentMonth()) {
  const value = Number(expense.value);
  const category = normalizeCategoryName(expense.category);
  const month = isValidMonth(expense.month) ? expense.month : currentMonth;
  const name = String(expense.name || "").trim();

  if (!name || !Number.isFinite(value) || value <= 0) {
    throw new Error("O arquivo possui gastos com dados inválidos.");
  }

  return {
    id: expense.id || createId(),
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

export function normalizeStoredExpense(expense, currentMonth = getCurrentMonth()) {
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
    month: isValidMonth(expense.month) ? expense.month : currentMonth,
    createdAt: expense.createdAt || new Date().toISOString(),
    source: expense.source || undefined,
    sourceId: expense.sourceId || undefined,
    sourceKey: expense.sourceKey || undefined,
    sourceData: expense.sourceData || undefined,
  };
}

export function mergeExpenses(currentExpenses, importedExpenses) {
  const merged = new Map(currentExpenses.map((expense) => [expense.id, expense]));

  for (const expense of importedExpenses) {
    merged.set(expense.id, expense);
  }

  return [...merged.values()];
}

export function normalizeCategoryName(category) {
  const value = String(category || "");

  if (CATEGORIES.includes(value)) {
    return value;
  }

  return LEGACY_CATEGORY_NAMES[value] || "Outros";
}

export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function isValidMonth(value) {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value);
}

export function formatMonthLabel(value) {
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

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatMoneyInput(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseMoneyInput(value) {
  const normalized = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : NaN;
}

export function maskMoneyInputValue(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatMoneyInput(Number(digits) / 100);
}

export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export function normalizeForMatching(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const lowerEntity = entity.toLowerCase();

    if (lowerEntity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(lowerEntity.slice(2), 16));
    }

    if (lowerEntity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(lowerEntity.slice(1), 10));
    }

    return namedEntities[lowerEntity] || match;
  });
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() || String(Date.now());
}
