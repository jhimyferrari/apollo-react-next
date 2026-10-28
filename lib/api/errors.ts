import { type FieldValues, type UseFormSetError, type Path } from "react-hook-form";
import type { ParsedApiError, RawApiErrorPayload } from "./types";

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
  let fields: Record<string, string[]> = {};

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

    // Heurísticas adicionais para mapear campos quando a API não retorna a chave 'fields' estruturada
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
  } else if (typeof error === "string") {
    message = error;
  }

  const isValidationError =
    code === "VALIDATION_ERROR" ||
    code === "INVALID_PASSWORD" ||
    statusCode === 422 ||
    Object.keys(fields).length > 0;

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
 * Conecta os erros da API diretamente ao react-hook-form.
 * Retorna `true` se ao menos um campo foi mapeado no formulário, ou `false` caso contrário.
 */
export function applyApiValidationErrors<T extends FieldValues>(
  parsedError: ParsedApiError,
  setError: UseFormSetError<T>
): boolean {
  if (!parsedError.isValidationError || !parsedError.fields) {
    return false;
  }

  let appliedAny = false;
  for (const [field, messages] of Object.entries(parsedError.fields)) {
    if (messages && messages.length > 0) {
      setError(field as Path<T>, {
        type: "server",
        message: messages[0],
      });
      appliedAny = true;
    }
  }

  return appliedAny;
}
