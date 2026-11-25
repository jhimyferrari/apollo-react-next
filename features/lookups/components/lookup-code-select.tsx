"use client";

import React, { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseApiError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface LookupOptionItem {
  id: string;
  number: number;
}

export interface LookupCodeSelectProps<T extends LookupOptionItem> {
  id?: string;
  value: string;
  onValueChange: (id: string, resolvedItem?: T) => void;
  options: T[];
  selectedFallback?: T | null;
  lookupByNumber: (number: number) => Promise<ApiResponse<T>>;
  renderOptionLabel: (item: T) => React.ReactNode;
  placeholder: string;
  codePlaceholder?: string;
  emptyOption?: { value: string; label: string };
  resourceLabel: string;
  disabled?: boolean;
  isLoadingOptions?: boolean;
  className?: string;
}

/**
 * Combina um campo numérico de código sequencial (`number`) com um `<Select>` sincronizado.
 * A busca unitária dispara em `Enter` ou `Blur` e mantém fallback de cache local para itens recém-resolvidos.
 */
export function LookupCodeSelect<T extends LookupOptionItem>({
  id,
  value,
  onValueChange,
  options,
  selectedFallback,
  lookupByNumber,
  renderOptionLabel,
  placeholder,
  codePlaceholder = "Cód.",
  emptyOption,
  resourceLabel,
  disabled = false,
  isLoadingOptions = false,
  className,
}: LookupCodeSelectProps<T>) {
  const normalizedValue =
    emptyOption && value === emptyOption.value ? "" : value;

  const [prevNormalizedValue, setPrevNormalizedValue] = useState(normalizedValue);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [draftCode, setDraftCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [resolvedExtras, setResolvedExtras] = useState<T[]>([]);
  const requestIdRef = useRef(0);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  if (prevNormalizedValue !== normalizedValue) {
    setPrevNormalizedValue(normalizedValue);
    setIsEditingCode(false);
    setDraftCode("");
    setLookupError(null);
    setIsSearching(false);
  }

  const mergedOptions = useMemo(() => {
    const existingIds = new Set(options.map((opt) => opt.id));
    const extras: T[] = [];
    if (selectedFallback && !existingIds.has(selectedFallback.id)) {
      existingIds.add(selectedFallback.id);
      extras.push(selectedFallback);
    }
    for (const extra of resolvedExtras) {
      if (!existingIds.has(extra.id)) {
        existingIds.add(extra.id);
        extras.push(extra);
      }
    }
    return extras.length > 0 ? [...options, ...extras] : options;
  }, [options, resolvedExtras, selectedFallback]);

  const selectedItem = useMemo(
    () => mergedOptions.find((item) => item.id === normalizedValue),
    [mergedOptions, normalizedValue]
  );

  const displayCode = isEditingCode
    ? draftCode
    : selectedItem
      ? String(selectedItem.number)
      : "";

  const clearSelectionOnInvalidLookup = () => {
    if (normalizedValue !== "") {
      setPrevNormalizedValue("");
      onValueChange("");
    }
  };

  const commitCodeLookup = async (rawCode: string) => {
    const trimmed = rawCode.trim();

    if (trimmed === "") {
      setIsEditingCode(false);
      setLookupError(null);
      if (normalizedValue !== "") {
        setPrevNormalizedValue("");
        onValueChange("");
      }
      return;
    }

    const num = Number(trimmed);
    if (!Number.isSafeInteger(num) || num < 1) {
      setLookupError(`Código inválido para ${resourceLabel.toLowerCase()}.`);
      clearSelectionOnInvalidLookup();
      return;
    }

    if (selectedItem && selectedItem.number === num) {
      setIsEditingCode(false);
      setLookupError(null);
      return;
    }

    const reqId = ++requestIdRef.current;
    setIsSearching(true);
    setLookupError(null);

    try {
      const res = await lookupByNumber(num);
      if (reqId !== requestIdRef.current) return;

      const found = res?.data;
      if (!found) {
        setLookupError(`Código ${num} não encontrado.`);
        clearSelectionOnInvalidLookup();
        return;
      }

      setResolvedExtras((prev) =>
        prev.some((item) => item.id === found.id) ? prev : [...prev, found]
      );
      setIsEditingCode(false);
      setLookupError(null);
      setPrevNormalizedValue(found.id);
      onValueChange(found.id, found);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      const parsed = parseApiError(err);
      if (parsed.statusCode === 404) {
        setLookupError(`Código ${num} não encontrado.`);
      } else {
        setLookupError(parsed.message);
      }
      clearSelectionOnInvalidLookup();
    } finally {
      if (reqId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setIsEditingCode(true);
    setDraftCode(digitsOnly);
    setLookupError(null);
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isEditingCode) {
        void commitCodeLookup(draftCode);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      requestIdRef.current += 1;
      setIsSearching(false);
      setIsEditingCode(false);
      setLookupError(null);
    }
  };

  const handleCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      e.relatedTarget &&
      selectTriggerRef.current?.contains(e.relatedTarget as Node)
    ) {
      requestIdRef.current += 1;
      setIsSearching(false);
      setIsEditingCode(false);
      setLookupError(null);
      return;
    }

    if (isEditingCode) {
      void commitCodeLookup(draftCode);
    }
  };

  const handleSelectChange = (nextValue: string) => {
    requestIdRef.current += 1;
    setIsSearching(false);
    setIsEditingCode(false);
    setLookupError(null);

    if (emptyOption && nextValue === emptyOption.value) {
      setPrevNormalizedValue("");
      onValueChange("");
      return;
    }

    const found = mergedOptions.find((item) => item.id === nextValue);
    setPrevNormalizedValue(nextValue);
    onValueChange(nextValue, found);
  };

  const selectValue = emptyOption
    ? normalizedValue || emptyOption.value
    : normalizedValue;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <Input
            type="text"
            inputMode="numeric"
            value={displayCode}
            onChange={handleCodeChange}
            onKeyDown={handleCodeKeyDown}
            onBlur={handleCodeBlur}
            placeholder={codePlaceholder}
            aria-label={`Código de ${resourceLabel}`}
            aria-invalid={Boolean(lookupError)}
            disabled={disabled || isSearching}
            className={cn(
              "w-20 sm:w-24 font-mono text-sm",
              isSearching && "pr-7",
              lookupError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {isSearching && (
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Select
            value={selectValue}
            onValueChange={handleSelectChange}
            onOpenChange={(open) => {
              if (open && isEditingCode) {
                requestIdRef.current += 1;
                setIsSearching(false);
                setIsEditingCode(false);
                setLookupError(null);
              }
            }}
            disabled={disabled || isLoadingOptions}
          >
            <SelectTrigger ref={selectTriggerRef} id={id}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {emptyOption && (
                <SelectItem value={emptyOption.value}>
                  {emptyOption.label}
                </SelectItem>
              )}
              {mergedOptions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {renderOptionLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {lookupError && (
        <p className="text-xs text-destructive">{lookupError}</p>
      )}
    </div>
  );
}

