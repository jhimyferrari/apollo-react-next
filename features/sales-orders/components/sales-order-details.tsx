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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { maskDocument, maskPhone } from "@/lib/masks";
import {
  useConfirmSalesOrder,
  useReopenSalesOrder,
  useCancelSalesOrder,
} from "../hooks/use-sales-orders";
import type { SalesOrderResource } from "../types";
import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Ban,
  User,
  Briefcase,
  Package,
} from "lucide-react";

interface SalesOrderDetailsProps {
  order: SalesOrderResource;
}

export function SalesOrderDetails({ order }: SalesOrderDetailsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const confirmMutation = useConfirmSalesOrder();
  const reopenMutation = useReopenSalesOrder();
  const cancelMutation = useCancelSalesOrder();

  const isActionPending =
    confirmMutation.isPending || reopenMutation.isPending || cancelMutation.isPending;

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(order.id);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleReopen = async () => {
    try {
      await reopenMutation.mutateAsync(order.id);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: order.id });
      setShowCancelDialog(false);
    } catch {
      // Erro tratado no hook
    }
  };

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
    <div className="space-y-6">
      {/* Barra Superior de Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sales-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant={currentStatus.variant} className="text-xs">
              {currentStatus.label}
            </Badge>
            <Badge
              variant={order.payment_status === "paid" ? "default" : "outline"}
              className="text-xs"
            >
              {order.payment_status === "paid" ? "Pago" : "Pagamento Pendente"}
            </Badge>
          </div>
        </div>

        {/* Botões de Ação do Ciclo de Vida */}
        <div className="flex items-center gap-2">
          {order.status === "draf" && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirm}
              disabled={isActionPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Pedido
            </Button>
          )}

          {order.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReopen}
              disabled={isActionPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reabrir Pedido
            </Button>
          )}

          {order.status !== "cancelled" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              disabled={isActionPending}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancelar Pedido
            </Button>
          )}
        </div>
      </div>

      {/* Grid com Cliente e Vendedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações do Cliente */}
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2 text-sm">
            <div className="font-semibold text-foreground">
              {order.client?.legal_name || "Cliente não informado"}
            </div>
            {order.client?.trade_name && (
              <div className="text-xs text-muted-foreground">
                Nome Fantasia: {order.client.trade_name}
              </div>
            )}
            {order.client?.document && (
              <div className="text-xs font-mono text-muted-foreground">
                Documento: {maskDocument(order.client.document)}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {order.client?.email ? `E-mail: ${order.client.email}` : ""}
              {order.client?.phone ? ` • Tel: ${maskPhone(order.client.phone)}` : ""}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Vendedor & Pedido */}
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Vendedor & Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2 text-sm">
            <div className="font-semibold text-foreground">
              {order.seller?.trade_name || order.seller?.legal_name || "Vendedor não informado"}
            </div>
            <div className="text-xs text-muted-foreground">
              Data de Emissão: {formatDate(order.created_at)}
            </div>
            {order.confirmed_at && (
              <div className="text-xs text-emerald-600">
                Confirmado em: {formatDateTime(order.confirmed_at)}
              </div>
            )}
            {order.cancelled_at && (
              <div className="text-xs text-destructive">
                Cancelado em: {formatDateTime(order.cancelled_at)}
                {order.cancellation_reason ? ` • Motivo: ${order.cancellation_reason}` : ""}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Itens do Pedido */}
      <Card className="border border-border overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Produtos e Quantidades
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Item</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="w-24 text-center">Unidade</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço Unitário</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items && order.items.length > 0 ? (
              order.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{it.number}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {it.product?.name || `Produto #${it.product_id}`}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs uppercase">
                    {it.product?.unit || "un"}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    <MoneyDisplay value={it.unit_price} />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-foreground">
                    <MoneyDisplay value={it.subtotal} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum item vinculado ao pedido.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Rodapé com Valor Total */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Total do Pedido
          </span>
          <span className="text-xl font-bold text-foreground tabular-nums">
            <MoneyDisplay value={order.total} />
          </span>
        </div>
      </Card>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Pedido de Venda"
        description="Tem certeza que deseja cancelar este pedido? As mercadorias serão devolvidas ao estoque."
        confirmLabel="Confirmar Cancelamento"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
