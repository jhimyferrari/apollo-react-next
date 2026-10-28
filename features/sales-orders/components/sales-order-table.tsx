"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { formatDate } from "@/lib/formatters";
import {
  useSalesOrders,
  useConfirmSalesOrder,
  useReopenSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
} from "../hooks/use-sales-orders";
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
} from "lucide-react";
import type { SalesOrderResource } from "../types";

export function SalesOrderTable() {
  const [page, setPage] = useState(1);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrderResource | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<SalesOrderResource | null>(null);

  const { data, isLoading, isError, error, refetch } = useSalesOrders(page);
  const confirmMutation = useConfirmSalesOrder();
  const reopenMutation = useReopenSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const orders = data?.data || [];
  const meta = data?.meta;

  const handleConfirmOrder = async (id: string) => {
    try {
      await confirmMutation.mutateAsync(id);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleReopenOrder = async (id: string) => {
    try {
      await reopenMutation.mutateAsync(id);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    try {
      await cancelMutation.mutateAsync({ id: orderToCancel.id });
      setOrderToCancel(null);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    try {
      await deleteMutation.mutateAsync(orderToDelete.id);
      setOrderToDelete(null);
    } catch {
      // Erro tratado no hook
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={8} cols={7} />;
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

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhum pedido de venda encontrado"
        description="Emita pedidos de venda vinculando clientes, vendedores e itens do catálogo."
        action={
          <Button asChild>
            <Link href="/sales-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido de Venda
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-right">Total (R$)</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="w-28 text-center">Pagamento</TableHead>
              <TableHead className="w-28">Data</TableHead>
              <TableHead className="w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusMap: Record<
                string,
                { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
              > = {
                draf: { label: "Rascunho", variant: "secondary" },
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
                    <Badge
                      variant={order.payment_status === "paid" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {order.payment_status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/sales-orders/${order.id}`}
                            className="cursor-pointer flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            Visualizar Detalhes
                          </Link>
                        </DropdownMenuItem>

                        {order.status === "draf" && (
                          <DropdownMenuItem
                            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                            onClick={() => handleConfirmOrder(order.id)}
                            disabled={confirmMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar Pedido
                          </DropdownMenuItem>
                        )}

                        {order.status === "confirmed" && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleReopenOrder(order.id)}
                            disabled={reopenMutation.isPending}
                          >
                            <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                            Reabrir Pedido
                          </DropdownMenuItem>
                        )}

                        {order.status !== "cancelled" && (
                          <DropdownMenuItem
                            className="text-amber-600 focus:text-amber-600 cursor-pointer"
                            onClick={() => setOrderToCancel(order)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setOrderToDelete(order)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
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
    </div>
  );
}
