"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  LayoutGrid,
  LineChart,
  PackageSearch,
  ReceiptText,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { cn } from "@/lib/utils";
import type { ReportBreakdownEntry } from "../types";

export const STATUS_LABELS: Record<string, string> = {
  draf: "Rascunho",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
};

const REPORT_NAV_ITEMS = [
  {
    label: "Central de Relatórios",
    href: "/reports",
    icon: LayoutGrid,
    exact: true,
  },
  {
    label: "Resumo de Vendas",
    href: "/reports/sales/summary",
    icon: LineChart,
    permission: "sales-order.view",
  },
  {
    label: "Vendas por Produto",
    href: "/reports/sales/by-product",
    icon: PackageSearch,
    permission: "sales-order.view",
  },
  {
    label: "Vendas por Vendedor",
    href: "/reports/sales/by-seller",
    icon: UserCheck,
    permission: "sales-order.view",
  },
  {
    label: "Resumo de Compras",
    href: "/reports/purchases/summary",
    icon: ReceiptText,
    permission: "purchase-order.view",
  },
];

export function ReportNav() {
  const pathname = usePathname();
  const { can } = usePermissions();

  const visibleItems = REPORT_NAV_ITEMS.filter(
    (item) => !item.permission || can(item.permission)
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1.5">
      {visibleItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

type StatAccent = "primary" | "emerald" | "amber" | "sky";

const ACCENT_STYLES: Record<StatAccent, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ElementType;
  accent?: StatAccent;
}) {
  return (
    <Card className="py-4 gap-2 border-border/80 shadow-xs">
      <CardContent className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-1.5 tabular-nums">
              {value}
            </p>
          </div>
          {Icon && (
            <div
              className={cn(
                "h-9 w-9 rounded-lg border flex items-center justify-center shrink-0",
                ACCENT_STYLES[accent]
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-2 truncate">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const BREAKDOWN_BAR_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500",
  paid: "bg-emerald-500",
  draf: "bg-amber-500",
  pending: "bg-amber-500",
  cancelled: "bg-rose-500",
};

const BREAKDOWN_DOT_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500",
  paid: "bg-emerald-500",
  draf: "bg-amber-500",
  pending: "bg-amber-500",
  cancelled: "bg-rose-500",
};

export function BreakdownCard({
  title,
  subtitle,
  entries,
  labels,
  expectedKeys,
}: {
  title: string;
  subtitle?: string;
  entries: Record<string, ReportBreakdownEntry>;
  labels: Record<string, string>;
  expectedKeys?: string[];
}) {
  const keys = expectedKeys
    ? Array.from(new Set([...expectedKeys, ...Object.keys(entries)]))
    : Object.keys(entries);

  const rows = keys
    .map((key) => ({
      key,
      entry: entries[key] ?? {
        count: 0,
        total: "0.0000",
        total_formatted: "R$ 0,00",
      },
    }))
    .filter((r) => expectedKeys || r.entry.count > 0);

  const totalCount = rows.reduce((acc, r) => acc + r.entry.count, 0);
  const totalAmount = rows.reduce(
    (acc, r) => acc + (Number(r.entry.total) || 0),
    0
  );

  return (
    <Card className="py-4 gap-3 border-border/80 shadow-xs">
      <CardContent className="px-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-[11px] font-medium">
            {totalCount} {totalCount === 1 ? "pedido" : "pedidos"}
          </Badge>
        </div>

        {rows.length === 0 || totalCount === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sem movimentações registradas para os critérios informados.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ key, entry }) => {
              const amountNum = Number(entry.total) || 0;
              const pct =
                totalAmount > 0
                  ? Math.min(100, Math.max(0, (amountNum / totalAmount) * 100))
                  : totalCount > 0
                  ? Math.min(100, Math.max(0, (entry.count / totalCount) * 100))
                  : 0;

              return (
                <li key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          BREAKDOWN_DOT_COLORS[key] || "bg-primary"
                        )}
                      />
                      <span className="font-medium text-foreground text-xs">
                        {labels[key] ?? key}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({entry.count} {entry.count === 1 ? "pedido" : "pedidos"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {pct.toLocaleString("pt-BR", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                      <span className="font-semibold tabular-nums text-xs text-foreground">
                        {entry.total_formatted}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        BREAKDOWN_BAR_COLORS[key] || "bg-primary"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "confirmed"
      ? "default"
      : status === "cancelled"
      ? "destructive"
      : "secondary";
  return (
    <Badge variant={variant} className="text-[10px]">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "paid" ? "default" : "outline"}
      className="text-[10px]"
    >
      {PAYMENT_LABELS[status] ?? status}
    </Badge>
  );
}

export function ReportError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
      <h3 className="font-semibold text-destructive">
        Não foi possível gerar o relatório
      </h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {message || "Erro de comunicação com a API."}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

export function ReportEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="Nenhum registro encontrado para os filtros aplicados"
      description="Não há movimentações que correspondam aos critérios selecionados. Experimente ampliar o período ou alterar o status do pedido."
      action={
        onReset ? (
          <Button variant="outline" size="sm" onClick={onReset}>
            Restaurar filtros padrão
          </Button>
        ) : undefined
      }
    />
  );
}

export function ReportStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl border border-border bg-card animate-pulse"
        />
      ))}
    </div>
  );
}
