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
import { formatDate, formatQuantity } from "@/lib/formatters";
import {
  useSalesSummaryReport,
  usePurchasesSummaryReport,
} from "../hooks/use-reports";
import { ReportFilterBar } from "./report-filter-bar";
import {
  BreakdownCard,
  PAYMENT_LABELS,
  PaymentBadge,
  ReportEmpty,
  ReportError,
  ReportStatsSkeleton,
  STATUS_LABELS,
  StatCard,
  StatusBadge,
} from "./report-shared";
import type {
  OrderSummaryTotals,
  PurchaseSummaryRow,
  ReportFilters,
  ReportPaginationMeta,
  SalesSummaryRow,
} from "../types";
import type { PaginationMeta } from "@/lib/api/types";

interface SummaryViewProps {
  kind: "sales" | "purchases";
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  refetch: () => void;
  totals?: OrderSummaryTotals;
  rows: (SalesSummaryRow | PurchaseSummaryRow)[];
  meta?: ReportPaginationMeta;
  onPageChange: (page: number) => void;
}

/** Converte o meta enxuto dos relatórios para o formato esperado pela paginação padrão. */
function toPaginationMeta(meta: ReportPaginationMeta): PaginationMeta {
  return { ...meta, links: [], path: null };
}

function SummaryView({
  kind,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  refetch,
  totals,
  rows,
  meta,
  onPageChange,
}: SummaryViewProps) {
  if (isError) return <ReportError message={errorMessage} onRetry={refetch} />;

  const partnerLabel = kind === "sales" ? "Cliente" : "Fornecedor";

  return (
    <div className="space-y-6">
      {isLoading || !totals ? (
        <ReportStatsSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={kind === "sales" ? "Total vendido" : "Total comprado"}
              value={totals.total_amount_formatted}
            />
            <StatCard title="Pedidos" value={totals.orders_count} />
            <StatCard title="Ticket médio" value={totals.average_ticket_formatted} />
            <StatCard
              title="Itens (quantidade total)"
              value={formatQuantity(totals.total_items_quantity)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownCard
              title="Distribuição por status"
              entries={totals.by_status}
              labels={STATUS_LABELS}
            />
            <BreakdownCard
              title="Distribuição por pagamento"
              entries={totals.by_payment_status}
              labels={PAYMENT_LABELS}
            />
          </div>
        </>
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
                  <TableHead>{partnerLabel}</TableHead>
                  {kind === "sales" && <TableHead>Vendedor</TableHead>}
                  <TableHead className="w-20 text-right">Itens</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-28 text-center">Pagamento</TableHead>
                  <TableHead className="w-28">Confirmação</TableHead>
                  <TableHead className="w-28">Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const partner =
                    kind === "sales"
                      ? (row as SalesSummaryRow).client
                      : (row as PurchaseSummaryRow).supplier;
                  const seller = kind === "sales" ? (row as SalesSummaryRow).seller : null;

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{row.number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {partner?.legal_name || "-"}
                          </span>
                          {partner?.trade_name && (
                            <span className="text-xs text-muted-foreground">
                              {partner.trade_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {kind === "sales" && (
                        <TableCell className="text-sm text-muted-foreground">
                          {seller?.trade_name || seller?.legal_name || "-"}
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums">{row.items_count}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {row.total_formatted}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <PaymentBadge status={row.payment_status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(row.confirmed_at)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(row.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {meta && (
            <DataTablePagination
              meta={toPaginationMeta(meta)}
              onPageChange={onPageChange}
              isLoading={isFetching}
            />
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_FILTERS: ReportFilters = { per_page: 15, page: 1 };

export function SalesSummaryReportView() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const q = useSalesSummaryReport(filters);

  return (
    <div className="space-y-6">
      <ReportFilterBar
        fields={["period", "date_field", "status", "payment_status", "client", "seller"]}
        value={filters}
        onApply={setFilters}
      />
      <SummaryView
        kind="sales"
        isLoading={q.isLoading}
        isFetching={q.isFetching}
        isError={q.isError}
        errorMessage={q.error?.message}
        refetch={() => q.refetch()}
        totals={q.data?.totals}
        rows={q.data?.data ?? []}
        meta={q.data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}

export function PurchasesSummaryReportView() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const q = usePurchasesSummaryReport(filters);

  return (
    <div className="space-y-6">
      <ReportFilterBar
        fields={["period", "date_field", "status", "payment_status", "supplier"]}
        value={filters}
        onApply={setFilters}
      />
      <SummaryView
        kind="purchases"
        isLoading={q.isLoading}
        isFetching={q.isFetching}
        isError={q.isError}
        errorMessage={q.error?.message}
        refetch={() => q.refetch()}
        totals={q.data?.totals}
        rows={q.data?.data ?? []}
        meta={q.data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}

