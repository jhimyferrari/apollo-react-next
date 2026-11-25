"use client";

import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortState } from "@/lib/table-utils";

export interface TableFilterConfig {
  id: string;
  label: string;
  value: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  widthClassName?: string;
}

export interface TableSortOption {
  value: string;
  label: string;
}

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: TableFilterConfig[];
  sortOptions?: TableSortOption[];
  sortState?: SortState | null;
  onSortKeyChange?: (key: string) => void;
  onSortDirectionToggle?: () => void;
  onClearAll?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  hasActiveFilters?: boolean;
  isFetching?: boolean;
  filteredCount: number;
  totalCount: number;
}

const DEFAULT_SORT = "__default__";

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar registros...",
  filters = [],
  sortOptions = [],
  sortState = null,
  onSortKeyChange,
  onSortDirectionToggle,
  onClearAll,
  onSubmit,
  submitLabel = "Buscar",
  hasActiveFilters = false,
  isFetching = false,
  filteredCount,
  totalCount,
}: DataTableToolbarProps) {
  const showSummary = hasActiveFilters || filteredCount !== totalCount;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="rounded-md border border-border bg-card p-3 space-y-2.5"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-2.5 flex-wrap">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(
              "pl-9",
              (searchValue || isFetching) && "pr-8"
            )}
          />
          {isFetching ? (
            <Loader2
              className="h-4 w-4 animate-spin text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          ) : (
            searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        {/* Filtros dinâmicos */}
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={cn("w-full md:w-44", filter.widthClassName)}
          >
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger aria-label={filter.label}>
                <SelectValue placeholder={filter.allLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filter.allLabel}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Reorganizador / Ordenação */}
        {sortOptions.length > 0 && onSortKeyChange && (
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <div className="flex-1 md:w-44">
              <Select
                value={sortState?.key ?? DEFAULT_SORT}
                onValueChange={(val) =>
                  onSortKeyChange(val === DEFAULT_SORT ? "" : val)
                }
              >
                <SelectTrigger aria-label="Ordenar por">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_SORT}>Ordem padrão</SelectItem>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {onSortDirectionToggle && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onSortDirectionToggle}
                disabled={!sortState}
                title={
                  !sortState
                    ? "Selecione um campo para ordenar"
                    : sortState.direction === "asc"
                      ? "Ordem crescente (clique para inverter)"
                      : "Ordem decrescente (clique para inverter)"
                }
                aria-label="Inverter direção da ordenação"
                className="shrink-0"
              >
                {!sortState ? (
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                ) : sortState.direction === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {onSubmit && (
          <Button
            type="submit"
            size="sm"
            disabled={isFetching}
            className="shrink-0"
          >
            {isFetching ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="mr-1.5 h-3.5 w-3.5" />
            )}
            {submitLabel}
          </Button>
        )}

        {hasActiveFilters && onClearAll && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {showSummary && (
        <p className="text-xs text-muted-foreground">
          Exibindo <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          de <span className="font-medium text-foreground">{totalCount}</span>{" "}
          {totalCount === 1 ? "registro encontrado" : "registros encontrados"}
        </p>
      )}
    </form>
  );
}

interface SortableTableHeadProps {
  label: string;
  sortKey: string;
  sortState: SortState | null;
  onSort: (key: string) => void;
  align?: "left" | "right" | "center";
  className?: string;
}

export function SortableTableHead({
  label,
  sortKey,
  sortState,
  onSort,
  align = "left",
  className,
}: SortableTableHeadProps) {
  const isActive = sortState?.key === sortKey;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 font-medium text-left hover:text-foreground transition-colors cursor-pointer",
          align === "right" && "w-full justify-end",
          align === "center" && "w-full justify-center",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        {isActive ? (
          sortState.direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

