"use client";

import React, { useState } from "react";
import { CalendarDays, Filter, RefreshCw, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { useFilterOptions, type FilterEntity } from "../hooks/use-reports";
import type { ReportFilters } from "../types";

export type ReportFilterField =
  | "period"
  | "date_field"
  | "status"
  | "payment_status"
  | "client"
  | "seller"
  | "supplier"
  | "product"
  | "category"
  | "brand";

interface ReportFilterBarProps {
  fields: ReportFilterField[];
  /** Filtros atualmente aplicados. */
  value: ReportFilters;
  onApply: (filters: ReportFilters) => void;
  /** Opções de ordenação (para relatórios agrupados). */
  orderOptions?: { value: string; label: string }[];
  /** Callback opcional para recarregar os dados atuais. */
  onRefresh?: () => void;
  isFetching?: boolean;
}

const ALL = "__all__";

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmados (padrão)" },
  { value: "draf", label: "Rascunhos" },
  { value: "cancelled", label: "Cancelados" },
];

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
];

const DATE_FIELD_OPTIONS = [
  { value: "confirmed_at", label: "Data de confirmação" },
  { value: "created_at", label: "Data de criação" },
];

const PER_PAGE_OPTIONS = [
  { value: "15", label: "15 por página" },
  { value: "30", label: "30 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
];

/**
 * Mapeia cada entidade para o endpoint `/v1/lookups/*` correspondente e a lista de
 * permissões aceitas pelo `LookupController` no backend (`ability:...` any-match).
 */
const ENTITY_CONFIG: Record<
  Exclude<
    ReportFilterField,
    "period" | "date_field" | "status" | "payment_status"
  >,
  {
    entity: FilterEntity;
    key: keyof ReportFilters;
    label: string;
    permissions: string[];
    all: string;
  }
> = {
  client: {
    entity: "clients",
    key: "client_id",
    label: "Cliente",
    permissions: [
      "client.view",
      "sales-order.view",
      "sales-order.create",
      "sales-order.update",
    ],
    all: "Todos os clientes",
  },
  seller: {
    entity: "sellers",
    key: "seller_id",
    label: "Vendedor",
    permissions: [
      "seller.view",
      "sales-order.view",
      "sales-order.create",
      "sales-order.update",
    ],
    all: "Todos os vendedores",
  },
  supplier: {
    entity: "suppliers",
    key: "supplier_id",
    label: "Fornecedor",
    permissions: [
      "supplier.view",
      "purchase-order.view",
      "purchase-order.create",
      "purchase-order.update",
    ],
    all: "Todos os fornecedores",
  },
  product: {
    entity: "products",
    key: "product_id",
    label: "Produto",
    permissions: [
      "product.view",
      "sales-order.view",
      "sales-order.create",
      "sales-order.update",
      "purchase-order.view",
      "purchase-order.create",
      "purchase-order.update",
    ],
    all: "Todos os produtos",
  },
  category: {
    entity: "categories",
    key: "category_id",
    label: "Categoria",
    permissions: ["category.view", "product.create", "product.update"],
    all: "Todas as categorias",
  },
  brand: {
    entity: "brands",
    key: "brand_id",
    label: "Marca",
    permissions: ["brand.view", "product.create", "product.update"],
    all: "Todas as marcas",
  },
};

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type DatePresetId =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "allTime";

function getPresetRange(preset: DatePresetId): {
  start_date?: string;
  end_date?: string;
} {
  const now = new Date();
  const todayStr = toISODate(now);

  switch (preset) {
    case "today":
      return { start_date: todayStr, end_date: todayStr };
    case "last7": {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return { start_date: toISODate(start), end_date: todayStr };
    }
    case "last30": {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      return { start_date: toISODate(start), end_date: todayStr };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start_date: toISODate(start), end_date: todayStr };
    }
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start_date: toISODate(start), end_date: toISODate(end) };
    }
    case "thisYear": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start_date: toISODate(start), end_date: todayStr };
    }
    case "allTime":
      return { start_date: undefined, end_date: undefined };
  }
}

const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "last7", label: "Últimos 7 dias" },
  { id: "last30", label: "Últimos 30 dias" },
  { id: "thisMonth", label: "Este mês" },
  { id: "lastMonth", label: "Mês passado" },
  { id: "thisYear", label: "Este ano" },
  { id: "allTime", label: "Todo o período" },
];

function SimpleSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EntitySelect({
  field,
  value,
  onChange,
}: {
  field: keyof typeof ENTITY_CONFIG;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const config = ENTITY_CONFIG[field];
  const { can } = usePermissions();
  const allowed = can(config.permissions, "any");
  const { data, isLoading } = useFilterOptions(config.entity, allowed);

  if (!allowed) return null;

  return (
    <SimpleSelect
      label={config.label}
      value={value}
      onChange={onChange}
      options={data ?? []}
      allLabel={isLoading ? "Carregando opções..." : config.all}
    />
  );
}

function countActiveFilters(filters: ReportFilters): number {
  const ignoredKeys = new Set(["page", "per_page"]);
  let count = 0;
  for (const [k, v] of Object.entries(filters)) {
    if (!ignoredKeys.has(k) && v !== undefined && v !== null && v !== "") {
      count += 1;
    }
  }
  return count;
}

export function ReportFilterBar({
  fields,
  value,
  onApply,
  orderOptions,
  onRefresh,
  isFetching = false,
}: ReportFilterBarProps) {
  const [draft, setDraft] = useState<ReportFilters>(value);

  const set = <K extends keyof ReportFilters>(
    key: K,
    v: ReportFilters[K] | undefined
  ) => setDraft((prev) => ({ ...prev, [key]: v }));

  const invalidRange =
    Boolean(draft.start_date && draft.end_date) &&
    draft.end_date! < draft.start_date!;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidRange) return;
    onApply({ ...draft, page: 1 });
  };

  const handleClear = () => {
    const cleared: ReportFilters = { per_page: draft.per_page ?? 15, page: 1 };
    setDraft(cleared);
    onApply(cleared);
  };

  const handleApplyPreset = (presetId: DatePresetId) => {
    const range = getPresetRange(presetId);
    const updated: ReportFilters = {
      ...draft,
      start_date: range.start_date,
      end_date: range.end_date,
      page: 1,
    };
    setDraft(updated);
    onApply(updated);
  };

  const has = (f: ReportFilterField) => fields.includes(f);
  const activeCount = countActiveFilters(value);

  return (
    <form
      onSubmit={handleApply}
      className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-xs"
    >
      {/* Cabeçalho de Filtros e Atalhos Rápidos de Data */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Filtros e Parâmetros
          </span>
          {activeCount > 0 && (
            <Badge variant="default" className="text-[10px] h-5 px-1.5">
              {activeCount} {activeCount === 1 ? "filtro ativo" : "filtros ativos"}
            </Badge>
          )}
        </div>

        {has("period") && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Período rápido:
            </span>
            {DATE_PRESETS.map((preset) => {
              const range = getPresetRange(preset.id);
              const isSelected =
                (draft.start_date ?? undefined) === range.start_date &&
                (draft.end_date ?? undefined) === range.end_date;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Campos de Filtro */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {has("period") && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="start_date" className="text-xs text-muted-foreground">
                Data inicial
              </Label>
              <Input
                id="start_date"
                type="date"
                value={draft.start_date ?? ""}
                onChange={(e) => set("start_date", e.target.value || undefined)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date" className="text-xs text-muted-foreground">
                Data final
              </Label>
              <Input
                id="end_date"
                type="date"
                min={draft.start_date}
                value={draft.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value || undefined)}
              />
            </div>
          </>
        )}

        {has("date_field") && (
          <SimpleSelect
            label="Critério de data"
            value={draft.date_field}
            onChange={(v) => set("date_field", v as ReportFilters["date_field"])}
            options={DATE_FIELD_OPTIONS}
            allLabel="Automático (conforme status)"
          />
        )}

        {has("status") && (
          <SimpleSelect
            label="Status do pedido"
            value={draft.status}
            onChange={(v) => set("status", v as ReportFilters["status"])}
            options={STATUS_OPTIONS}
            allLabel="Confirmados (padrão)"
          />
        )}

        {has("payment_status") && (
          <SimpleSelect
            label="Status de pagamento"
            value={draft.payment_status}
            onChange={(v) =>
              set("payment_status", v as ReportFilters["payment_status"])
            }
            options={PAYMENT_OPTIONS}
            allLabel="Todos os status"
          />
        )}

        {(Object.keys(ENTITY_CONFIG) as (keyof typeof ENTITY_CONFIG)[])
          .filter((f) => has(f))
          .map((f) => (
            <EntitySelect
              key={f}
              field={f}
              value={draft[ENTITY_CONFIG[f].key] as string | undefined}
              onChange={(v) => set(ENTITY_CONFIG[f].key, v as never)}
            />
          ))}

        {orderOptions && (
          <>
            <SimpleSelect
              label="Ordenar por"
              value={draft.order_by}
              onChange={(v) => set("order_by", v)}
              options={orderOptions}
              allLabel="Valor total (padrão)"
            />
            <SimpleSelect
              label="Direção da ordenação"
              value={draft.order_direction}
              onChange={(v) =>
                set("order_direction", v as ReportFilters["order_direction"])
              }
              options={[
                { value: "desc", label: "Maior para menor (DESC)" },
                { value: "asc", label: "Menor para maior (ASC)" },
              ]}
              allLabel="Maior para menor (padrão)"
            />
          </>
        )}

        {/* Itens por página */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Registros por página
          </Label>
          <Select
            value={String(draft.per_page ?? 15)}
            onValueChange={(v) => set("per_page", Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {invalidRange && (
        <p className="text-xs text-destructive font-medium">
          A data final deve ser igual ou posterior à data inicial.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
        <div className="text-[11px] text-muted-foreground">
          Sem filtro de status, a análise considera os pedidos <strong>Confirmados</strong>.
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              Atualizar
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Limpar
          </Button>
          <Button type="submit" size="sm" disabled={invalidRange}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Aplicar filtros
          </Button>
        </div>
      </div>
    </form>
  );
}
