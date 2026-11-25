/**
 * Utilitários de formatação para pt-BR e moeda brasileira (BRL).
 *
 * REGRA CRÍTICA DO CONTRATO DA API:
 * Campos Money podem chegar como objeto `{ amount, currency, formatted }` ou string numérica.
 * NUNCA converter para float binário para evitar perda de precisão de ponto flutuante.
 */

export interface MoneySerialized {
  amount: string;
  currency?: string;
  formatted?: string;
}

export type MoneyLike = string | number | MoneySerialized | null | undefined;

export interface FormatBRLOptions {
  minDecimals?: number;
  maxDecimals?: number;
}

/**
 * Extrai a string numérica de um campo `Money` (objeto `{ amount }` ou primitivo `string | number`).
 */
export function extractMoneyAmount(value: MoneyLike, fallback = "0"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") {
    return value.amount !== undefined && value.amount !== null && value.amount !== ""
      ? String(value.amount)
      : fallback;
  }
  return String(value);
}

/**
 * Formata um valor de dinheiro (objeto Money, string vinda do backend ou número) para BRL.
 * Suporta até 4 dígitos decimais para valores fracionários do sistema (ex.: "1234.5678" -> "R$ 1.234,5678").
 */
export function formatBRL(
  value: MoneyLike,
  options?: FormatBRLOptions
): string {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }

  const rawAmount = typeof value === "object" ? value.amount : value;
  if (rawAmount === null || rawAmount === undefined || rawAmount === "") {
    return "R$ 0,00";
  }

  const strVal = String(rawAmount).trim().replace(",", ".");
  const numericVal = Number(strVal);

  if (Number.isNaN(numericVal)) {
    return "R$ 0,00";
  }

  // Detecta se a string possui casas decimais além de 2
  const decimalPart = strVal.split(".")[1] || "";
  const significantDecimals = decimalPart.replace(/0+$/, "").length;

  const rawMin =
    options?.minDecimals ?? (significantDecimals > 2 ? Math.min(significantDecimals, 4) : 2);
  const rawMax =
    options?.maxDecimals ?? Math.max(rawMin, Math.min(Math.max(significantDecimals, 2), 4));

  const maxDecimals = Math.min(20, Math.max(0, Math.floor(rawMax)));
  const minDecimals = Math.min(maxDecimals, Math.max(0, Math.floor(rawMin)));

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(numericVal);
}

/**
 * Formata uma data/hora ISO (ex: "2026-10-09T15:00:00Z") para pt-BR.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formata uma data no formato brasileiro dd/mm/aaaa.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formata quantidades numéricas (ex: 12.500 kg, 10 un).
 */
export function formatQuantity(
  qty: string | number | null | undefined,
  unit?: string
): string {
  if (qty === null || qty === undefined || qty === "") return "-";
  const num = Number(qty);
  if (Number.isNaN(num)) return `${qty} ${unit ?? ""}`.trim();

  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(num);

  return unit ? `${formatted} ${unit}` : formatted;
}
