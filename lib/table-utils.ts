import { extractMoneyAmount, type MoneyLike } from "./formatters";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string = string> {
  key: K;
  direction: SortDirection;
}

export interface BaseListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: SortDirection;
}

/**
 * Normaliza texto para busca client-side insensível a acentos e maiúsculas/minúsculas.
 */
export function normalizeSearchText(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Verifica se `query` corresponde a algum dos campos fornecidos.
 * Remove `#` inicial da consulta para permitir buscar por código tanto com `12` quanto com `#12`.
 */
export function matchesSearch(
  query: string,
  fields: ReadonlyArray<string | number | null | undefined>
): boolean {
  const normalizedQuery = normalizeSearchText(query).replace(/^#/, "");
  if (!normalizedQuery) return true;

  return fields.some((field) =>
    normalizeSearchText(field).includes(normalizedQuery)
  );
}

/**
 * Alterna a direção quando a mesma chave já está ativa ou ativa uma nova chave na direção padrão.
 */
export function toggleSortState<K extends string>(
  current: SortState<K> | null,
  key: K,
  defaultDirection: SortDirection = "asc"
): SortState<K> {
  if (current?.key === key) {
    return {
      key,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return { key, direction: defaultDirection };
}

/**
 * Ordena itens preservando valores vazios ao final da listagem.
 */
export function sortItems<T, K extends string>(
  items: ReadonlyArray<T>,
  sort: SortState<K> | null,
  accessors: Record<K, (item: T) => string | number | null | undefined>
): T[] {
  if (!sort) return [...items];

  const accessor = accessors[sort.key];
  if (!accessor) return [...items];

  const multiplier = sort.direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const valA = accessor(a);
    const valB = accessor(b);

    const isEmptyA = valA === null || valA === undefined || valA === "";
    const isEmptyB = valB === null || valB === undefined || valB === "";

    if (isEmptyA && isEmptyB) return 0;
    if (isEmptyA) return 1;
    if (isEmptyB) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      if (valA === valB) return 0;
      return (valA < valB ? -1 : 1) * multiplier;
    }

    return (
      String(valA).localeCompare(String(valB), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      }) * multiplier
    );
  });
}

/**
 * Converte campo Money (`{ amount }` / `{ amount: unknown }`) ou string/number para valor numérico ordenável.
 */
export function toNumericValue(value: unknown): number {
  if (
    typeof value === "object" &&
    value !== null &&
    "amount" in value
  ) {
    const amount = (value as { amount?: unknown }).amount;
    if (amount === null || amount === undefined || amount === "") return 0;
    const parsed = Number(String(amount).replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const raw = extractMoneyAmount(value as MoneyLike, "0").replace(",", ".");
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Remove valores vazios (`undefined`, `""`, `"all"`) dos parâmetros de listagem enviados à API.
 */
export function cleanListParams<T extends object>(
  params?: T
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(params as Record<string, unknown>)) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "" || (key !== "search" && trimmed === "all")) continue;
      cleaned[key] = trimmed;
    } else if (typeof val === "number" || typeof val === "boolean") {
      cleaned[key] = val;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
