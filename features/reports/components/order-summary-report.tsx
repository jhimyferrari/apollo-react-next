"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Eye,
  Layers,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  ReportNav,
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
  onResetFilters: () => void;
  totals?: OrderSummaryTotals;
  rows: (SalesSummaryRow | PurchaseSummaryRow)[];
  meta?: ReportPaginationMeta;
  onPageChange: (page: number) => void;
}

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
  onResetFilters,
  totals,
  rows,
  meta,
  onPageChange,
}: SummaryViewProps) {
  const { can } = usePermissions();
  const canViewClient = can("client.view");
  const canViewSeller = can("seller.view");
  const canViewSupplier = can("supplier.view");

  if (isError) return <ReportError message={errorMessage} onRetry={refetch} />;

  const isSales = kind === "sales";
  const partnerLabel = isSales ? "Cliente" : "Fornecedor";
  const orderBasePath = isSales ? "/sales-orders" : "/purchase-orders";

  const avgItemsPerOrder =
    totals && totals.orders_count > 0
      ? (Number(totals.total_items_quantity) / totals.orders_count).toLocaleString(
          "pt-BR",
          { maximumFractionDigits: 2 }
        )
      : "0";

  return (
    <div className="space-y-6">
      {isLoading || !totals ? (
        <ReportStatsSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={isSales ? "Faturamento no Período" : "Volume Comprado no Período"}
              value={totals.total_amount_formatted}
              hint={`Baseado em ${totals.orders_count} ${
                totals.orders_count === 1 ? "pedido filtrado" : "pedidos filtrados"
              }`}
              icon={DollarSign}
              accent="emerald"
            />
            <StatCard
              title="Total de Pedidos"
              value={totals.orders_count}
              hint={
                isSales
                  ? "Ordens de venda contabilizadas"
                  : "Ordens de compra contabilizadas"
              }
              icon={isSales ? ShoppingCart : ShoppingBag}
              accent="primary"
            />
            <StatCard
              title="Ticket Médio por Pedido"
              value={totals.average_ticket_formatted}
              hint="Valor médio por operação"
              icon={TrendingUp}
              accent="sky"
            />
            <StatCard
              title="Volume Total de Itens"
              value={formatQuantity(totals.total_items_quantity)}
              hint={`Média de ${avgItemsPerOrder} un./itens por pedido`}
              icon={Layers}
              accent="amber"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownCard
              title="Distribuição por Status do Pedido"
              subtitle="Panorama geral no período e parceiro selecionados"
              entries={totals.by_status}
              labels={STATUS_LABELS}
              expectedKeys={["confirmed", "draf", "cancelled"]}
            />
            <BreakdownCard
              title="Distribuição por Status de Pagamento"
              subtitle="Proporção financeira entre pedidos pagos e pendentes"
              entries={totals.by_payment_status}
              labels={PAYMENT_LABELS}
              expectedKeys={["paid", "pending"]}
            />
          </div>
        </>
      )}

      {isLoading ? (
        <TableSkeleton rows={6} cols={isSales ? 9 : 8} />
      ) : rows.length === 0 ? (
        <ReportEmpty onReset={onResetFilters} />
      ) : (
        <div
          className={
            isFetching ? "opacity-70 transition-opacity" : "transition-opacity"
          }
        >
          <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Listagem Detalhada de {isSales ? "Pedidos de Venda" : "Pedidos de Compra"}
              </span>
              {meta && (
                <span className="text-xs text-muted-foreground">
                  Total de <strong>{meta.total}</strong>{" "}
                  {meta.total === 1 ? "registro" : "registros"}
                </span>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Pedido</TableHead>
                  <TableHead>{partnerLabel}</TableHead>
                  {isSales && <TableHead>Vendedor</TableHead>}
                  <TableHead className="w-20 text-right">Itens</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-28 text-center">Pagamento</TableHead>
                  <TableHead className="w-28">Confirmação</TableHead>
                  <TableHead className="w-28">Emissão</TableHead>
                  <TableHead className="w-16 text-center">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const partner = isSales
                    ? (row as SalesSummaryRow).client
                    : (row as PurchaseSummaryRow).supplier;
                  const seller = isSales ? (row as SalesSummaryRow).seller : null;
                  const canLinkPartner = isSales ? canViewClient : canViewSupplier;
                  const partnerBasePath = isSales ? "/clients" : "/suppliers";

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`${orderBasePath}/${row.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          #{row.number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {partner ? (
                          <div className="flex flex-col">
                            {canLinkPartner ? (
                              <Link
                                href={`${partnerBasePath}/${partner.id}`}
                                className="font-medium text-foreground hover:text-primary hover:underline"
                              >
                                {partner.trade_name || partner.legal_name}
                              </Link>
                            ) : (
                              <span className="font-medium text-foreground">
                                {partner.trade_name || partner.legal_name}
                              </span>
                            )}
                            {partner.trade_name &&
                              partner.legal_name &&
                              partner.trade_name !== partner.legal_name && (
                                <span className="text-xs text-muted-foreground">
                                  {partner.legal_name}
                                </span>
                              )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {isSales && (
                        <TableCell className="text-sm text-muted-foreground">
                          {seller ? (
                            canViewSeller ? (
                              <Link
                                href={`/sellers/${seller.id}`}
                                className="hover:text-primary hover:underline"
                              >
                                {seller.trade_name || seller.legal_name}
                              </Link>
                            ) : (
                              seller.trade_name || seller.legal_name
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right tabular-nums text-sm">
                        {row.items_count}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-foreground">
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
                      <TableCell className="text-center">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Visualizar pedido"
                        >
                          <Link href={`${orderBasePath}/${row.id}`}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
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
      <ReportNav />
      <ReportFilterBar
        fields={[
          "period",
          "date_field",
          "status",
          "payment_status",
          "client",
          "seller",
        ]}
        value={filters}
        onApply={setFilters}
        onRefresh={() => q.refetch()}
        isFetching={q.isFetching}
      />
      <SummaryView
        kind="sales"
        isLoading={q.isLoading}
        isFetching={q.isFetching}
        isError={q.isError}
        errorMessage={q.error?.message}
        refetch={() => q.refetch()}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
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
      <ReportNav />
      <ReportFilterBar
        fields={[
          "period",
          "date_field",
          "status",
          "payment_status",
          "supplier",
        ]}
        value={filters}
        onApply={setFilters}
        onRefresh={() => q.refetch()}
        isFetching={q.isFetching}
      />
      <SummaryView
        kind="purchases"
        isLoading={q.isLoading}
        isFetching={q.isFetching}
        isError={q.isError}
        errorMessage={q.error?.message}
        refetch={() => q.refetch()}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        totals={q.data?.totals}
        rows={q.data?.data ?? []}
        meta={q.data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}
