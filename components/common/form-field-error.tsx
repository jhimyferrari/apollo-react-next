import React from "react";
import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormFieldErrorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?:
    | string
    | string[]
    | FieldError
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Merge<FieldError, FieldErrorsImpl<any>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any
    | null
    | undefined;
  className?: string;
}

/**
 * Componente único de campo com erro, reutilizado por todos os formulários.
 * Suporta strings diretas, arrays de mensagens do backend ou objetos FieldError do react-hook-form.
 */
export function FormFieldError({ error, className = "" }: FormFieldErrorProps) {
  if (!error) return null;

  let message: string | null = null;

  if (typeof error === "string") {
    message = error;
  } else if (Array.isArray(error)) {
    message = error.join(", ");
  } else if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    message = error.message;
  }

  if (!message) return null;

  return (
    <p
      role="alert"
      className={`text-xs font-medium text-destructive mt-1.5 transition-all ${className}`}
    >
      {message}
    </p>
  );
}
