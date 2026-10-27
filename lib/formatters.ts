/**
 * Utilitários de formatação para pt-BR e moeda brasileira (BRL).
 *
 * REGRA CRÍTICA DO CONTRATO DA API:
 * Campos Money chegam como string no JSON (ex.: "1250.50", "99.90").
 * NUNCA converter para float binário para evitar perda de precisão de ponto flutuante.
 */

export interface FormatBRLOptions {
  minDecimals?: number;
  maxDecimals?: number;
}

/**
 * Formata um valor de dinheiro (string vinda do backend ou número) para BRL.
 * Suporta até 4 dígitos decimais para variáveis monetárias do sistema (ex.: "1234.5678" -> "R$ 1.234,5678").
 */
export function formatBRL(
  value: string | number | null | undefined,
  options?: FormatBRLOptions
): string {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }

  const strVal = String(value).trim().replace(",", ".");
  const numericVal = Number(strVal);

  if (Number.isNaN(numericVal)) {
    return "R$ 0,00";
  }

  // Detecta se a string possui casas decimais além de 2
  const decimalPart = strVal.split(".")[1] || "";
  const significantDecimals = decimalPart.replace(/0+$/, "").length;

  const minDecimals =
    options?.minDecimals ?? (significantDecimals > 2 ? Math.min(significantDecimals, 4) : 2);
  const maxDecimals =
    options?.maxDecimals ?? Math.max(minDecimals, Math.min(Math.max(significantDecimals, 2), 4));

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
