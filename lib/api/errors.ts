import { type FieldValues, type UseFormSetError, type Path } from "react-hook-form";
import { toast } from "sonner";
import type { ParsedApiError, RawApiErrorPayload } from "./types";

const GLOBAL_NON_FIELD_KEYS = new Set([
  "payload",
  "item_id",
  "organization_id",
  "addressable_id",
]);

function normalizeBackendFieldAliases(fields: Record<string, string[]>): void {
  // Normaliza chave singular 'permission' ou 'permissions.*' vinda do backend para 'permissions'
  if (fields.permission?.length) {
    if (!fields.permissions?.length) {
      fields.permissions = fields.permission;
    }
    delete fields.permission;
  }
  for (const key of Object.keys(fields)) {
    if (key.startsWith("permissions.")) {
      if (!fields.permissions?.length && fields[key]?.length) {
        fields.permissions = fields[key];
      }
      delete fields[key];
    }
  }

  // Fallback defensivo caso alguma resposta retorne 'product_unit' no lugar de 'unit'
  if (fields.product_unit?.length) {
    if (!fields.unit?.length) {
      fields.unit = fields.product_unit;
    }
    delete fields.product_unit;
  }

  // Produto registra categorias como 'category_ids' no react-hook-form
  if (fields.categories?.length) {
    if (!fields.category_ids?.length) {
      fields.category_ids = fields.categories;
    }
    delete fields.categories;
  }
  for (const key of Object.keys(fields)) {
    if (key.startsWith("categories.")) {
      if (!fields.category_ids?.length && fields[key]?.length) {
        fields.category_ids = fields[key];
      }
      delete fields[key];
    }
  }

  // Fallback defensivo caso alguma resposta retorne 'starts_at' no lugar de 'started_at'
  if (fields.starts_at?.length) {
    if (!fields.started_at?.length) {
      fields.started_at = fields.starts_at;
    }
    delete fields.starts_at;
  }
}

/**
 * Utilitário central para normalização e tratamento de erros da API.
 * Requisito: Todo erro da API vem no formato:
 * { "error": { "code": "...", "message": "...", "fields": { "campo": ["msg"] } } }
 * com fallback para o formato padrão do Laravel { "message": "...", "errors": { ... } }.
 */
export function parseApiError(
  error: unknown,
  fallbackStatusCode = 500
): ParsedApiError {
  let statusCode = fallbackStatusCode;
  let code = "UNKNOWN_ERROR";
  let message = "Ocorreu um erro inesperado. Por favor, tente novamente.";
  const fields: Record<string, string[]> = {};

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;

    if (typeof errObj.status === "number") {
      statusCode = errObj.status;
    } else if (typeof errObj.statusCode === "number") {
      statusCode = errObj.statusCode;
    }

    const payload = (errObj.data || errObj.response || errObj) as RawApiErrorPayload;

    if (payload.error) {
      if (payload.error.code) code = String(payload.error.code);
      if (payload.error.message) message = String(payload.error.message);

      if (payload.error.fields) {
        if (typeof payload.error.fields === "object" && !Array.isArray(payload.error.fields)) {
          for (const [key, val] of Object.entries(payload.error.fields)) {
            if (Array.isArray(val)) {
              fields[key] = val.map(String);
            } else if (typeof val === "string") {
              fields[key] = [val];
            }
          }
        } else if (typeof payload.error.fields === "string") {
          message = payload.error.fields;
        }
      }
    }

    // Fallbacks para Laravel padrão caso a chave 'error' não venha encapsulada
    if (!payload.error && payload.message) {
      message = String(payload.message);
    }
    if (!payload.error && payload.errors) {
      for (const [key, val] of Object.entries(payload.errors)) {
        if (Array.isArray(val)) {
          fields[key] = val.map(String);
        } else if (typeof val === "string") {
          fields[key] = [val];
        }
      }
    }

    if (statusCode === 422 && code === "UNKNOWN_ERROR") {
      code = "VALIDATION_ERROR";
    }
    if (statusCode === 401 && code === "UNKNOWN_ERROR") {
      code = "UNAUTHENTICATED";
    }
    if (statusCode === 403 && code === "UNKNOWN_ERROR") {
      code = "FORBIDDEN";
    }
    if (statusCode === 404 && code === "UNKNOWN_ERROR") {
      code = "NOT_FOUND";
    }
    if (statusCode === 429) {
      if (code === "UNKNOWN_ERROR") {
        code = "RATE_LIMITED";
      }
      if (!payload.error?.message && !payload.message) {
        message =
          "Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.";
      }
    }
    if (
      (statusCode === 502 || statusCode === 503 || statusCode === 504) &&
      code === "UNKNOWN_ERROR"
    ) {
      code = "UPSTREAM_UNAVAILABLE";
    }

    normalizeBackendFieldAliases(fields);

    // Heurísticas adicionais para mapear campos quando a API retorna 422 / DUPLICATE_FIELD / INVALID_PASSWORD sem 'fields' estruturado
    if (
      statusCode === 422 ||
      code === "VALIDATION_ERROR" ||
      code === "INVALID_PASSWORD" ||
      code === "DUPLICATE_FIELD"
    ) {
      const lowerMsg = message.toLowerCase();
      if (
        !fields.password &&
        (code === "INVALID_PASSWORD" || lowerMsg.includes("password") || lowerMsg.includes("senha"))
      ) {
        fields.password = [message];
      }
      if (
        !fields.document &&
        (lowerMsg.includes("document") || lowerMsg.includes("cpf") || lowerMsg.includes("cnpj"))
      ) {
        fields.document = [message];
      }
      if (!fields.email && (lowerMsg.includes("email") || lowerMsg.includes("e-mail"))) {
        fields.email = [message];
      }
      if (
        !fields.state_registration &&
        (lowerMsg.includes("state_registration") || lowerMsg.includes("inscrição estadual"))
      ) {
        fields.state_registration = [message];
      }
      if (!fields.ean && lowerMsg.includes("ean")) {
        fields.ean = [message];
      }
      if (!fields.ncm && lowerMsg.includes("ncm")) {
        fields.ncm = [message];
      }
      if (
        !fields.name &&
        !lowerMsg.includes("razão") &&
        !lowerMsg.includes("fantasia") &&
        (lowerMsg.includes("campo nome") || lowerMsg.includes("field name") || lowerMsg.includes("`name`"))
      ) {
        fields.name = [message];
      }
    }
  } else if (typeof error === "string") {
    message = error;
  }

  const hasFieldErrors = Object.keys(fields).length > 0;

  const isValidationError =
    hasFieldErrors &&
    (code === "VALIDATION_ERROR" ||
      code === "INVALID_PASSWORD" ||
      code === "DUPLICATE_FIELD" ||
      statusCode === 422);

  const isUnauthenticated =
    code === "UNAUTHENTICATED" || statusCode === 401;

  return {
    code,
    message,
    fields,
    statusCode,
    isValidationError,
    isUnauthenticated,
  };
}

/**
 * Retorna a primeira mensagem de validação de campo encontrada, ou a mensagem geral do erro.
 */
export function getFirstValidationMessage(
  parsedError: ParsedApiError,
  fallbackMessage?: string
): string {
  for (const messages of Object.values(parsedError.fields || {})) {
    if (messages && messages.length > 0 && messages[0]) {
      return messages[0];
    }
  }
  return (
    parsedError.message ||
    fallbackMessage ||
    "Erro de validação nos dados enviados."
  );
}

function isKnownFormField(
  field: string,
  knownFields?: ReadonlyArray<string>
): boolean {
  if (GLOBAL_NON_FIELD_KEYS.has(field)) {
    return false;
  }
  if (!knownFields || knownFields.length === 0) {
    return true;
  }
  return knownFields.some(
    (known) => field === known || field.startsWith(`${known}.`)
  );
}

/**
 * Conecta os erros da API diretamente ao react-hook-form.
 * Quando há erros em campos não mapeados no formulário (ou globais como `payload`/`item_id`),
 * exibe um toast com a mensagem específica para evitar falha silenciosa.
 * Retorna `true` se ao menos um campo foi mapeado no formulário, ou `false` caso contrário.
 */
export function applyApiValidationErrors<T extends FieldValues>(
  parsedError: ParsedApiError,
  setError: UseFormSetError<T>,
  options?: {
    knownFields?: ReadonlyArray<string>;
    showToastOnUnmapped?: boolean;
  }
): boolean {
  if (!parsedError.isValidationError || !parsedError.fields) {
    return false;
  }

  let appliedAny = false;
  const unmappedMessages: string[] = [];
  const entries = Object.entries(parsedError.fields);

  for (const [field, messages] of entries) {
    if (!messages || messages.length === 0) continue;

    if (isKnownFormField(field, options?.knownFields)) {
      setError(field as Path<T>, {
        type: "server",
        message: messages[0],
      });
      appliedAny = true;
    } else {
      unmappedMessages.push(messages[0]);
    }
  }

  const shouldToast = options?.showToastOnUnmapped !== false;
  if (shouldToast) {
    if (unmappedMessages.length > 0) {
      toast.error(unmappedMessages[0]);
    } else if (entries.length === 0 && parsedError.message) {
      toast.error(parsedError.message);
    }
  }

  return appliedAny;
}
