import React from "react";
import { formatBRL } from "@/lib/formatters";

interface MoneyDisplayProps {
  value: string | number | null | undefined;
  className?: string;
  minDecimals?: number;
  maxDecimals?: number;
}

/**
 * Componente para exibição estrita de campos Money sem converter para float.
 * Suporta até 4 casas decimais para valores fracionários.
 */
export function MoneyDisplay({
  value,
  className = "",
  minDecimals,
  maxDecimals =4,
}: MoneyDisplayProps) {
  const formatted = formatBRL(value, { minDecimals, maxDecimals });

  return (
    <span className={`font-medium tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
