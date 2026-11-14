import React from "react";
import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

interface FormFieldErrorProps {
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
  } else if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim() !== ""
  ) {
    message = error.message;
  } else if (
    typeof error === "object" &&
    "root" in error &&
    error.root &&
    typeof error.root === "object" &&
    "message" in error.root &&
    typeof error.root.message === "string" &&
    error.root.message.trim() !== ""
  ) {
    message = error.root.message;
  } else if (Array.isArray(error)) {
    const stringMessages = error.filter(
      (item): item is string => typeof item === "string" && item.trim() !== ""
    );
    if (stringMessages.length > 0) {
      message = stringMessages.join(", ");
    }
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
