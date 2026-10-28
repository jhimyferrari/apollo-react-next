/**
 * Tipos centrais da camada de API do Apollo System.
 * Segue estritamente o contrato do OpenAPI (api.json) e as diretrizes do projeto.
 */

export interface ApiResponse<T> {
  message?: string | number;
  data: T;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationMetaLink[];
  path: string | null;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Estrutura de erro da API.
 * Suporta o formato específico documentado no desafio:
 * { "error": { "code": "...", "message": "...", "fields": { "campo": ["msg"] } } }
 * E também o formato padrão Laravel:
 * { "message": "...", "errors": { "campo": ["msg"] } }
 */
export interface RawApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string[] | string> | string;
  };
  message?: string;
  errors?: Record<string, string[] | string>;
}

export interface ParsedApiError {
  code: string;
  message: string;
  fields: Record<string, string[]>;
  statusCode: number;
  isValidationError: boolean;
  isUnauthenticated: boolean;
}
