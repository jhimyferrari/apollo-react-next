"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
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
  /** Filtros atualmente aplicados (ponto de partida do rascunho). */
  value: ReportFilters;
  onApply: (filters: ReportFilters) => void;
  /** Opções de ordenação (apenas relatórios agrupados). */
  orderOptions?: { value: string; label: string }[];
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

const ENTITY_CONFIG: Record<
  Exclude<ReportFilterField, "period" | "date_field" | "status" | "payment_status">,
  { entity: FilterEntity; key: keyof ReportFilters; label: string; permission: string; all: string }
> = {
  client: { entity: "clients", key: "client_id", label: "Cliente", permission: "client.view", all: "Todos os clientes" },
  seller: { entity: "sellers", key: "seller_id", label: "Vendedor", permission: "seller.view", all: "Todos os vendedores" },
  supplier: { entity: "suppliers", key: "supplier_id", label: "Fornecedor", permission: "supplier.view", all: "Todos os fornecedores" },
  product: { entity: "products", key: "product_id", label: "Produto", permission: "product.view", all: "Todos os produtos" },
  category: { entity: "categories", key: "category_id", label: "Categoria", permission: "category.view", all: "Todas as categorias" },
  brand: { entity: "brands", key: "brand_id", label: "Marca", permission: "brand.view", all: "Todas as marcas" },
};

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
  const allowed = can(config.permission);
  const { data, isLoading } = useFilterOptions(config.entity, allowed);

  // Sem permissão de leitura da entidade, o filtro não é exibido (evita 403).
  if (!allowed) return null;

  return (
    <SimpleSelect
      label={config.label}
      value={value}
      onChange={onChange}
      options={data ?? []}
      allLabel={isLoading ? "Carregando..." : config.all}
    />
  );
}

export function ReportFilterBar({
  fields,
  value,
  onApply,
  orderOptions,
}: ReportFilterBarProps) {
  const [draft, setDraft] = useState<ReportFilters>(value);

  const set = <K extends keyof ReportFilters>(key: K, v: ReportFilters[K] | undefined) =>
    setDraft((prev) => ({ ...prev, [key]: v }));

  const invalidRange =
    Boolean(draft.start_date && draft.end_date) && draft.end_date! < draft.start_date!;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidRange) return;
    onApply({ ...draft, page: 1 });
  };

  const handleClear = () => {
    const cleared: ReportFilters = { per_page: value.per_page };
    setDraft(cleared);
    onApply(cleared);
  };

  const has = (f: ReportFilterField) => fields.includes(f);

  return (
    <form
      onSubmit={handleApply}
      className="rounded-lg border border-border bg-card p-4 space-y-4"
    >
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
            label="Filtrar período por"
            value={draft.date_field}
            onChange={(v) => set("date_field", v as ReportFilters["date_field"])}
            options={DATE_FIELD_OPTIONS}
            allLabel="Automático"
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
            label="Pagamento"
            value={draft.payment_status}
            onChange={(v) => set("payment_status", v as ReportFilters["payment_status"])}
            options={PAYMENT_OPTIONS}
            allLabel="Todos"
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
              allLabel="Padrão"
            />
            <SimpleSelect
              label="Direção"
              value={draft.order_direction}
              onChange={(v) => set("order_direction", v as ReportFilters["order_direction"])}
              options={[
                { value: "desc", label: "Maior para menor" },
                { value: "asc", label: "Menor para maior" },
              ]}
              allLabel="Padrão"
            />
          </>
        )}
      </div>

      {invalidRange && (
        <p className="text-xs text-destructive">
          A data final deve ser igual ou posterior à data inicial.
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
        <Button type="submit" size="sm" disabled={invalidRange}>
          <Search className="mr-2 h-4 w-4" />
          Aplicar filtros
        </Button>
      </div>
    </form>
  );
}

