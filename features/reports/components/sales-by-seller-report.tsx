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
import { maskDocument } from "@/lib/masks";
import { useSalesBySellerReport } from "../hooks/use-reports";
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
  { value: "orders_count", label: "Nº de pedidos" },
];

export function SalesBySellerReportView() {
  const [filters, setFilters] = useState<ReportFilters>({ per_page: 15, page: 1 });
  const { data, isLoading, isFetching, isError, error, refetch } =
    useSalesBySellerReport(filters);

  const rows = data?.data ?? [];
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <ReportFilterBar
        fields={["period", "date_field", "status", "seller"]}
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
              <StatCard title="Vendedores ativos" value={totals.active_sellers_count} />
              <StatCard title="Pedidos" value={totals.orders_count} />
              <StatCard title="Valor total" value={totals.total_amount_formatted} />
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : rows.length === 0 ? (
            <ReportEmpty />
          ) : (
            <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
              <div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="w-24 text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Ticket médio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-44">% do total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const pct = Math.min(100, Math.max(0, row.percentage_of_total));
                      return (
                        <TableRow key={row.seller_id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{row.seller_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {row.trade_name || row.legal_name}
                              </span>
                              {row.trade_name && (
                                <span className="text-xs text-muted-foreground">
                                  {row.legal_name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {maskDocument(row.document)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.orders_count}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.average_ticket_formatted}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {row.total_amount_formatted}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
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

