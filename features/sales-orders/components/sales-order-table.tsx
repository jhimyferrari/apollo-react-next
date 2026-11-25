"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import {
  DataTableToolbar,
  SortableTableHead,
} from "@/components/common/data-table-toolbar";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { formatDate } from "@/lib/formatters";
import {
  getAvailablePaymentAction,
  getPaymentStatusDisplay,
  type PaymentTransitionAction,
} from "@/lib/orders/payment-status";
import { toggleSortState, type SortState } from "@/lib/table-utils";
import {
  useSalesOrders,
  useConfirmSalesOrder,
  useReopenSalesOrder,
  useCancelSalesOrder,
  useUpdateSalesOrderPaymentStatus,
  useDeleteSalesOrder,
} from "../hooks/use-sales-orders";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  RotateCcw,
  Ban,
  Trash2,
  Plus,
  AlertCircle,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import type { SalesOrderResource } from "../types";

type SalesOrderSortKey =
  | "number"
  | "client"
  | "seller"
  | "total"
  | "status"
  | "payment_status"
  | "created_at";

const SALES_ORDER_SORT_OPTIONS: Array<{
  value: SalesOrderSortKey;
  label: string;
}> = [
  { value: "number", label: "Código (#)" },
  { value: "client", label: "Cliente" },
  { value: "seller", label: "Vendedor" },
  { value: "total", label: "Total (R$)" },
  { value: "status", label: "Status" },
  { value: "payment_status", label: "Pagamento" },
  { value: "created_at", label: "Data" },
];

export function SalesOrderTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortState, setSortState] =
    useState<SortState<SalesOrderSortKey> | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<{
    search: string;
    status: string;
    paymentStatus: string;
    sortState: SortState<SalesOrderSortKey> | null;
  }>({
    search: "",
    status: "all",
    paymentStatus: "all",
    sortState: null,
  });
  const [orderToDelete, setOrderToDelete] = useState<SalesOrderResource | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<SalesOrderResource | null>(null);
  const [paymentActionTarget, setPaymentActionTarget] = useState<{
    order: SalesOrderResource;
    action: PaymentTransitionAction;
  } | null>(null);

  const { can } = usePermissions();
  const canView = can("sales-order.view");
  const canCreate = can("sales-order.create");
  const canEdit = can("sales-order.update");
  const canDelete = can("sales-order.delete");
  const hasActions = canView || canEdit || canDelete;

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesOrders({
    page,
    search: appliedFilters.search,
    status: appliedFilters.status,
    payment_status: appliedFilters.paymentStatus,
    sort_by: appliedFilters.sortState?.key,
    sort_direction: appliedFilters.sortState?.direction,
  });
  const confirmMutation = useConfirmSalesOrder();
  const reopenMutation = useReopenSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const updatePaymentStatusMutation = useUpdateSalesOrderPaymentStatus();
  const deleteMutation = useDeleteSalesOrder();

  const orders = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  const hasDraftFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    sortState !== null;
  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" ||
    appliedFilters.status !== "all" ||
    appliedFilters.paymentStatus !== "all" ||
    appliedFilters.sortState !== null;
  const hasActiveFilters = hasDraftFilters || hasAppliedFilters;

  const handleApplyFilters = () => {
    const isSame =
      appliedFilters.search === search &&
      appliedFilters.status === statusFilter &&
      appliedFilters.paymentStatus === paymentFilter &&
      appliedFilters.sortState?.key === sortState?.key &&
      appliedFilters.sortState?.direction === sortState?.direction;

    if (isSame && page === 1) {
      void refetch();
      return;
    }

    setAppliedFilters({
      search,
      status: statusFilter,
      paymentStatus: paymentFilter,
      sortState,
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortState(null);
    setAppliedFilters({
      search: "",
      status: "all",
      paymentStatus: "all",
      sortState: null,
    });
    setPage(1);
  };

  const handleHeaderSort = (key: string) => {
    const nextSort = toggleSortState(
      appliedFilters.sortState,
      key as SalesOrderSortKey
    );
    setSortState(nextSort);
    setAppliedFilters((prev) => ({ ...prev, sortState: nextSort }));
    setPage(1);
  };

  const handleConfirmOrder = async (id: string) => {
    try {
      await confirmMutation.mutateAsync(id);
      if (orders.length === 1 && page > 1 && appliedFilters.status !== "all") {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  const handleReopenOrder = async (id: string) => {
    try {
      const res = await reopenMutation.mutateAsync(id);
      if (res?.data?.order?.id) {
        router.push(`/sales-orders/${res.data.order.id}`);
      }
    } catch {
      // Erro tratado no hook
    }
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    try {
      await cancelMutation.mutateAsync({ id: orderToCancel.id });
      setOrderToCancel(null);
      if (orders.length === 1 && page > 1 && appliedFilters.status !== "all") {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  const handlePaymentStatusConfirm = async () => {
    if (!paymentActionTarget) return;
    try {
      await updatePaymentStatusMutation.mutateAsync({
        id: paymentActionTarget.order.id,
        payment_status: paymentActionTarget.action.targetStatus,
      });
      setPaymentActionTarget(null);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    try {
      await deleteMutation.mutateAsync(orderToDelete.id);
      setOrderToDelete(null);
      if (orders.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // Erro tratado no hook
    }
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-8 text-center my-6">
        <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">
          Visualização não permitida
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Você não possui permissão para visualizar a listagem de pedidos de venda.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton rows={8} cols={hasActions ? 8 : 7} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center my-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="font-semibold text-destructive">
          Não foi possível carregar os pedidos de venda
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {error?.message || "Erro de comunicação com a API."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (orders.length === 0 && !hasAppliedFilters && page === 1 && (meta?.total ?? 0) === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhum pedido de venda encontrado"
        description="Emita pedidos de venda vinculando clientes, vendedores e itens do catálogo."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/sales-orders/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido de Venda
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número, cliente ou vendedor..."
        filters={[
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            allLabel: "Todos os status",
            options: [
              { value: "draft", label: "Rascunho" },
              { value: "confirmed", label: "Confirmado" },
              { value: "cancelled", label: "Cancelado" },
            ],
            onChange: setStatusFilter,
          },
          {
            id: "payment_status",
            label: "Pagamento",
            value: paymentFilter,
            allLabel: "Todos os pagamentos",
            options: [
              { value: "pending", label: "Pendente" },
              { value: "paid", label: "Pago" },
              { value: "refunded", label: "Estornado" },
              { value: "cancelled", label: "Cancelado" },
            ],
            onChange: setPaymentFilter,
          },
        ]}
        sortOptions={SALES_ORDER_SORT_OPTIONS}
        sortState={sortState}
        onSortKeyChange={(key) =>
          setSortState(
            key ? { key: key as SalesOrderSortKey, direction: sortState?.direction ?? "asc" } : null
          )
        }
        onSortDirectionToggle={() =>
          setSortState((prev) =>
            prev
              ? { ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }
              : null
          )
        }
        onSubmit={handleApplyFilters}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        isFetching={isFetching && !isLoading}
        filteredCount={orders.length}
        totalCount={meta?.total ?? orders.length}
      />

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="#"
                sortKey="number"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-16"
              />
              <SortableTableHead
                label="Cliente"
                sortKey="client"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="Vendedor"
                sortKey="seller"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
              />
              <SortableTableHead
                label="Total (R$)"
                sortKey="total"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="right"
              />
              <SortableTableHead
                label="Status"
                sortKey="status"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="center"
                className="w-28"
              />
              <SortableTableHead
                label="Pagamento"
                sortKey="payment_status"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                align="center"
                className="w-28"
              />
              <SortableTableHead
                label="Data"
                sortKey="created_at"
                sortState={appliedFilters.sortState}
                onSort={handleHeaderSort}
                className="w-28"
              />
              {hasActions && (
                <TableHead className="w-16 text-center">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActions ? 8 : 7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {page > 1 && meta && meta.total > 0 ? (
                    <>
                      <p>Nenhum registro nesta página.</p>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setPage(Math.max(1, meta.last_page))}
                        className="mt-1"
                      >
                        Ir para a última página
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>Nenhum pedido de venda encontrado com os filtros atuais.</p>
                      {hasAppliedFilters && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={clearAllFilters}
                          className="mt-1"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
              const statusMap: Record<
                string,
                { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
              > = {
                draft: { label: "Rascunho", variant: "secondary" },
                confirmed: { label: "Confirmado", variant: "default" },
                cancelled: { label: "Cancelado", variant: "destructive" },
              };

              const currentStatus = statusMap[order.status] || {
                label: order.status,
                variant: "outline",
              };

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{order.number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {order.client?.legal_name || "Cliente não informado"}
                      </span>
                      {order.client?.trade_name && (
                        <span className="text-xs text-muted-foreground">
                          {order.client.trade_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.seller?.trade_name || order.seller?.legal_name || "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    <MoneyDisplay value={order.total} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={currentStatus.variant} className="capitalize text-[10px]">
                      {currentStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      const paymentDisplay = getPaymentStatusDisplay(
                        order.payment_status
                      );
                      return (
                        <Badge
                          variant={paymentDisplay.variant}
                          className="text-[10px]"
                        >
                          {paymentDisplay.shortLabel}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  {hasActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Opções</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {canView && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/sales-orders/${order.id}`}
                                className="cursor-pointer flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                Visualizar Detalhes
                              </Link>
                            </DropdownMenuItem>
                          )}

                          {canView && canEdit && <DropdownMenuSeparator />}

                          {canEdit && order.status === "draft" && (
                            <DropdownMenuItem
                              className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                              onClick={() => handleConfirmOrder(order.id)}
                              disabled={confirmMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar Pedido
                            </DropdownMenuItem>
                          )}

                          {canEdit &&
                            (order.status === "confirmed" ||
                              order.status === "cancelled") && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleReopenOrder(order.id)}
                                disabled={reopenMutation.isPending}
                              >
                                <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                                Reabrir Pedido
                              </DropdownMenuItem>
                            )}

                          {canEdit &&
                            (() => {
                              const paymentAction = getAvailablePaymentAction(
                                order.status,
                                order.payment_status
                              );
                              if (!paymentAction) return null;
                              return (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setPaymentActionTarget({
                                      order,
                                      action: paymentAction,
                                    })
                                  }
                                  disabled={updatePaymentStatusMutation.isPending}
                                >
                                  <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {paymentAction.actionLabel}
                                </DropdownMenuItem>
                              );
                            })()}

                          {canEdit && order.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-amber-600 focus:text-amber-600 cursor-pointer"
                              onClick={() => setOrderToCancel(order)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancelar Pedido
                            </DropdownMenuItem>
                          )}

                          {(canView || canEdit) &&
                            canDelete &&
                            order.status === "draft" && (
                              <DropdownMenuSeparator />
                            )}
                          {canDelete && order.status === "draft" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setOrderToDelete(order)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <DataTablePagination
          meta={meta}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* Confirmação de Cancelamento */}
      <ConfirmDialog
        open={Boolean(orderToCancel)}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        title="Cancelar Pedido de Venda"
        description={`Deseja realmente cancelar o pedido #${orderToCancel?.number}? O estoque reservado será liberado.`}
        confirmLabel="Cancelar Pedido"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        open={Boolean(orderToDelete)}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
        title="Excluir Pedido de Venda"
        description={`Tem certeza que deseja excluir o pedido #${orderToDelete?.number}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      {/* Confirmação de Alteração de Pagamento */}
      <ConfirmDialog
        open={Boolean(paymentActionTarget)}
        onOpenChange={(open) => !open && setPaymentActionTarget(null)}
        title={paymentActionTarget?.action.dialogTitle || ""}
        description={
          paymentActionTarget
            ? paymentActionTarget.action.dialogDescription(
                paymentActionTarget.order.number
              )
            : ""
        }
        confirmLabel={paymentActionTarget?.action.confirmLabel}
        variant={paymentActionTarget?.action.variant}
        isLoading={updatePaymentStatusMutation.isPending}
        onConfirm={handlePaymentStatusConfirm}
      />
    </div>
  );
}
