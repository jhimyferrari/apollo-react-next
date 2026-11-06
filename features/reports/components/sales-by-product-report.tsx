"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  DollarSign,
  Layers,
  Package,
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
import { formatBRL, formatQuantity } from "@/lib/formatters";
import { useSalesByProductReport } from "../hooks/use-reports";
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
  { value: "quantity", label: "Quantidade vendida" },
  { value: "orders_count", label: "Nº de pedidos" },
];

const DEFAULT_FILTERS: ReportFilters = {
  per_page: 15,
  page: 1,
  order_by: "total_amount",
  order_direction: "desc",
};

export function SalesByProductReportView() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const { can } = usePermissions();
  const canViewProduct = can("product.view");

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSalesByProductReport(filters);

  const rows = data?.data ?? [];
  const totals = data?.totals;
  const globalTotalAmount = Number(totals?.total_amount ?? 0);

  const avgRevenuePerProduct =
    totals && totals.distinct_products_count > 0
      ? formatBRL(globalTotalAmount / totals.distinct_products_count)
      : "R$ 0,00";

  const toggleSort = (column: "total_amount" | "quantity" | "orders_count") => {
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
        fields={[
          "period",
          "date_field",
          "status",
          "product",
          "category",
          "brand",
          "seller",
        ]}
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
                title="Faturamento Total"
                value={totals.total_amount_formatted}
                hint="Soma consolidada dos itens vendidos"
                icon={DollarSign}
                accent="emerald"
              />
              <StatCard
                title="Produtos Distintos Vendidos"
                value={totals.distinct_products_count}
                hint="SKUs com movimentação no período"
                icon={Package}
                accent="primary"
              />
              <StatCard
                title="Volume Comercializado"
                value={formatQuantity(totals.total_quantity)}
                hint="Quantidade física total saída"
                icon={Boxes}
                accent="amber"
              />
              <StatCard
                title="Receita Média por Produto"
                value={avgRevenuePerProduct}
                hint="Média de faturamento por SKU"
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
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Desempenho Comercial por Produto (Curva de Receita e Volume)
                  </span>
                  {data?.meta && (
                    <span className="text-xs text-muted-foreground">
                      Total de <strong>{data.meta.total}</strong>{" "}
                      {data.meta.total === 1 ? "produto" : "produtos"}
                    </span>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          onClick={() => toggleSort("quantity")}
                          className="inline-flex items-center justify-end font-medium hover:text-foreground ml-auto"
                        >
                          Qtd. Vendida
                          {renderSortIcon("quantity")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Preço Médio</TableHead>
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
                      <TableHead className="text-right">
                        <button
                          type="button"
                          onClick={() => toggleSort("total_amount")}
                          className="inline-flex items-center justify-end font-medium hover:text-foreground ml-auto"
                        >
                          Valor Total
                          {renderSortIcon("total_amount")}
                        </button>
                      </TableHead>
                      <TableHead className="w-44">% do Faturamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => {
                      const rank = pageOffset + idx + 1;
                      const rowAmount = Number(row.total_amount) || 0;
                      const sharePct =
                        globalTotalAmount > 0
                          ? Math.min(
                              100,
                              Math.max(0, (rowAmount / globalTotalAmount) * 100)
                            )
                          : 0;

                      return (
                        <TableRow key={row.product_id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            <Badge
                              variant={rank <= 3 ? "default" : "outline"}
                              className="text-[10px] font-mono px-1.5"
                            >
                              {rank}º
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                #{row.product_number}
                              </span>
                              {canViewProduct ? (
                                <Link
                                  href={`/products/${row.product_id}`}
                                  className="font-medium text-foreground hover:text-primary hover:underline"
                                >
                                  {row.product_name}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground">
                                  {row.product_name}
                                </span>
                              )}
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase font-mono py-0 px-1.5"
                              >
                                {row.product_unit}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.brand?.name ?? "-"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatQuantity(row.quantity_sold, row.product_unit)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {row.average_unit_price_formatted}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.orders_count}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-foreground">
                            {row.total_amount_formatted}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${sharePct}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
                                {sharePct.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
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
