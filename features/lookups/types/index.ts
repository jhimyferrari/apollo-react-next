/**
 * Contratos dos endpoints de Lookup (`/v1/lookups/*`) para preenchimento de componentes `<Select>`.
 * Seguem estritamente os schemas `*LookupResource` e `LookupRequest` do OpenAPI (`api.json`).
 */

export interface LookupParams {
  /** Filtra por status (`"active"` por padrão no backend, ou `"all"` para incluir inativos). */
  status?: string | null;
  /** Termo de busca textual (máx. 100 caracteres). */
  search?: string | null;
}

export interface LookupResponse<T> {
  data: T[];
}

export interface MoneySerialized {
  amount: string;
  currency?: string;
  formatted?: string;
}

export type MoneyLike = string | number | MoneySerialized | null | undefined;

export interface BrandLookupResource {
  id: string;
  number: number;
  name: string;
}

export interface CategoryLookupResource {
  id: string;
  number: number;
  name: string;
}

export interface ClientLookupResource {
  id: string;
  number: number;
  name: string;
  document: string;
  status: string;
}

export interface SellerLookupResource {
  id: string;
  number: number;
  name: string;
  status: string;
}

export interface SupplierLookupResource {
  id: string;
  number: number;
  name: string;
  document: string;
  status: string;
}

export interface ProductLookupResource {
  id: string;
  number: number;
  name: string;
  unit: string;
  sale_price: MoneyLike;
  cost_price: MoneyLike;
  stock_quantity: MoneyLike;
  status: string;
}

/**
 * Extrai a string numérica de um campo `Money` (objeto `{ amount }` ou primitivo `string | number`).
 */
export function extractLookupAmount(value: MoneyLike, fallback = "0"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") {
    return String(value.amount ?? fallback);
  }
  return String(value);
}

