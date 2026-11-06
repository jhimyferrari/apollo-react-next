"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Briefcase,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { formatBRL } from "@/lib/formatters";
import { maskDocument } from "@/lib/masks";
import { useSalesBySellerReport } from "../hooks/use-reports";
import { ReportFilterBar } from "./report-filter-bar";
import {
  ReportEmpty,
  ReportError,
  ReportNav,
  ReportStatsSkeleton,
  StatCard,
} from "./report-shared";
import type { ReportFilters } from "../types";

const ORDER_OPTIONS = [
  { value: "total_amount", label: "Valor total vendido" },
  { value: "orders_count", label: "Nº de pedidos" },
];

const DEFAULT_FILTERS: ReportFilters = {
  per_page: 15,
  page: 1,
  order_by: "total_amount",
  order_direction: "desc",
};

export function SalesBySellerReportView() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const { can } = usePermissions();
  const canViewSeller = can("seller.view");

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSalesBySellerReport(filters);

  const rows = data?.data ?? [];
  const totals = data?.totals;
  const globalTotalAmount = Number(totals?.total_amount ?? 0);

  const avgRevenuePerSeller =
    totals && totals.active_sellers_count > 0
      ? formatBRL(globalTotalAmount / totals.active_sellers_count)
      : "R$ 0,00";

  const toggleSort = (column: "total_amount" | "orders_count") => {
    setFilters((prev) => {
      const currentOrderBy = prev.order_by ?? "total_amount";
      const currentDir = prev.order_direction ?? "desc";
      const nextDir =
        currentOrderBy === column && currentDir === "desc" ? "asc" : "desc";
      return {
        ...prev,
        order_by: column,
        order_direction: nextDir,
        page: 1,
      };
    });
  };

  const renderSortIcon = (column: string) => {
    const activeColumn = filters.order_by ?? "total_amount";
    const dir = filters.order_direction ?? "desc";
    if (activeColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/60" />;
    }
    return dir === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const pageOffset = ((data?.meta?.current_page ?? 1) - 1) * (data?.meta?.per_page ?? 15);

  return (
    <div className="space-y-6">
      <ReportNav />

      <ReportFilterBar
        fields={["period", "date_field", "status", "seller"]}
        value={filters}
        onApply={setFilters}
        orderOptions={ORDER_OPTIONS}
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {isError ? (
        <ReportError message={error?.message} onRetry={() => refetch()} />
      ) : (
        <>
          {isLoading || !totals ? (
            <ReportStatsSkeleton count={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Faturamento Comercial"
                value={totals.total_amount_formatted}
                hint="Soma consolidada das vendas por vendedor"
                icon={DollarSign}
                accent="emerald"
              />
              <StatCard
                title="Vendedores com Vendas"
                value={totals.active_sellers_count}
                hint="Representantes ativos no período"
                icon={Briefcase}
                accent="primary"
              />
              <StatCard
                title="Total de Pedidos"
                value={totals.orders_count}
                hint="Ordens de venda vinculadas"
                icon={ShoppingCart}
                accent="amber"
              />
              <StatCard
                title="Média por Vendedor"
                value={avgRevenuePerSeller}
                hint="Receita média gerada por representante"
                icon={TrendingUp}
                accent="sky"
              />
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={6} cols={8} />
          ) : rows.length === 0 ? (
            <ReportEmpty onReset={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <div
              className={
                isFetching
                  ? "opacity-70 transition-opacity"
                  : "transition-opacity"
              }
            >
              <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    Ranking de Desempenho Comercial por Vendedor
                  </span>
                  {data?.meta && (
                    <span className="text-xs text-muted-foreground">
                      Total de <strong>{data.meta.total}</strong>{" "}
                      {data.meta.total === 1 ? "vendedor" : "vendedores"}
                    </span>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="w-28 text-right">
                        <button
                          type="button"
                          onClick={() => toggleSort("orders_count")}
                          className="inline-flex items-center justify-end font-medium hover:text-foreground ml-auto"
                        >
                          Pedidos
                          {renderSortIcon("orders_count")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          onClick={() => toggleSort("total_amount")}
                          className="inline-flex items-center justify-end font-medium hover:text-foreground ml-auto"
                        >
                          Total Vendido
                          {renderSortIcon("total_amount")}
                        </button>
                      </TableHead>
                      <TableHead className="w-48">Participação (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => {
                      const rank = pageOffset + idx + 1;
                      const pct = Math.min(
                        100,
                        Math.max(0, row.percentage_of_total)
                      );
                      return (
                        <TableRow key={row.seller_id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            <Badge
                              variant={rank <= 3 ? "default" : "outline"}
                              className="text-[10px] font-mono px-1.5"
                            >
                              {rank}º
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{row.seller_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {canViewSeller ? (
                                <Link
                                  href={`/sellers/${row.seller_id}`}
                                  className="font-medium text-foreground hover:text-primary hover:underline"
                                >
                                  {row.trade_name || row.legal_name}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground">
                                  {row.trade_name || row.legal_name}
                                </span>
                              )}
                              {row.trade_name &&
                                row.legal_name &&
                                row.trade_name !== row.legal_name && (
                                  <span className="text-xs text-muted-foreground">
                                    {row.legal_name}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {row.document ? maskDocument(row.document) : "-"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {row.orders_count}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {row.average_ticket_formatted}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-foreground">
                            {row.total_amount_formatted}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
                                {row.percentage_of_total.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 2,
                                })}
                                %
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {data?.meta && (
                <DataTablePagination
                  meta={{ ...data.meta, links: [], path: null }}
                  onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
                  isLoading={isFetching}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
