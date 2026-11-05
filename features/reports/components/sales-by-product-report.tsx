"use client";

import React, { useState } from "react";
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
import { formatQuantity } from "@/lib/formatters";
import { useSalesByProductReport } from "../hooks/use-reports";
import { ReportFilterBar } from "./report-filter-bar";
import {
  ReportEmpty,
  ReportError,
  ReportStatsSkeleton,
  StatCard,
} from "./report-shared";
import type { ReportFilters } from "../types";

const ORDER_OPTIONS = [
  { value: "total_amount", label: "Valor total" },
  { value: "quantity", label: "Quantidade" },
  { value: "orders_count", label: "Nº de pedidos" },
];

export function SalesByProductReportView() {
  const [filters, setFilters] = useState<ReportFilters>({ per_page: 15, page: 1 });
  const { data, isLoading, isFetching, isError, error, refetch } =
    useSalesByProductReport(filters);

  const rows = data?.data ?? [];
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <ReportFilterBar
        fields={["period", "date_field", "status", "product", "category", "brand", "seller"]}
        value={filters}
        onApply={setFilters}
        orderOptions={ORDER_OPTIONS}
      />

      {isError ? (
        <ReportError message={error?.message} onRetry={() => refetch()} />
      ) : (
        <>
          {isLoading || !totals ? (
            <ReportStatsSkeleton count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard title="Produtos distintos vendidos" value={totals.distinct_products_count} />
              <StatCard
                title="Quantidade total"
                value={formatQuantity(totals.total_quantity)}
              />
              <StatCard title="Valor total" value={totals.total_amount_formatted} />
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : rows.length === 0 ? (
            <ReportEmpty />
          ) : (
            <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
              <div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead className="text-right">Qtd. vendida</TableHead>
                      <TableHead className="text-right">Preço médio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-24 text-right">Pedidos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.product_id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{row.product_number}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {row.product_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.brand?.name ?? "-"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatQuantity(row.quantity_sold, row.product_unit)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.average_unit_price_formatted}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {row.total_amount_formatted}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.orders_count}
                        </TableCell>
                      </TableRow>
                    ))}
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

