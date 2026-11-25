"use client";

import { useEffect, useState } from "react";

/**
 * Retorna uma versão com debounce do valor informado.
 * Quando o valor é string vazia, aplica atualização imediata ao limpar o campo.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const effectiveDelay =
      typeof value === "string" && value === "" ? 0 : delayMs;

    const timer = setTimeout(() => {
      setDebounced(value);
    }, effectiveDelay);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

