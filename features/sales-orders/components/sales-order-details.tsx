"use client";

import React, { useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MoneyDisplay } from "@/components/common/money-display";
import { formatDate, formatDateTime, formatQuantity } from "@/lib/formatters";
import { maskDocument, maskPhone, maskStock } from "@/lib/masks";
import {
  useUpdateSalesOrder,
  useConfirmSalesOrder,
  useReopenSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
} from "../hooks/use-sales-orders";
import { useClients } from "@/features/clients/hooks/use-clients";
import { useSellers } from "@/features/sellers/hooks/use-sellers";
import { useProducts } from "@/features/products/hooks/use-products";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import type {
  SalesOrderResource,
  PaymentStatus,
  UpdateSalesOrderRequest,
} from "../types";
import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Ban,
  User,
  Briefcase,
  Package,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Loader2,
  History,
} from "lucide-react";

interface SalesOrderDetailsProps {
  order: SalesOrderResource;
}

interface EditableOrderItem {
  originalId?: string;
  originalProductId?: string;
  originalQuantity?: number;
  originalNumber?: number;
  product_id: string;
  quantity: string;
  unit_price: string;
}

export function SalesOrderDetails({ order }: SalesOrderDetailsProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  const [editClientId, setEditClientId] = useState(order.client_id);
  const [editSellerId, setEditSellerId] = useState(order.seller_id);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>(
    order.payment_status
  );
  const [editItems, setEditItems] = useState<EditableOrderItem[]>([]);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);

  const { can } = usePermissions();
  const canEdit = can("sales-order.update");
  const canDelete = can("sales-order.delete");

  const updateMutation = useUpdateSalesOrder();
  const confirmMutation = useConfirmSalesOrder();
  const reopenMutation = useReopenSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const { data: clientsData } = useClients(1);
  const { data: sellersData } = useSellers(1);
  const { data: productsData } = useProducts(1);

  const clients = clientsData?.data || [];
  const sellers = sellersData?.data || [];
  const products = productsData?.data || [];

  const isActionPending =
    updateMutation.isPending ||
    confirmMutation.isPending ||
    reopenMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const startEditingDraft = () => {
    setEditClientId(order.client_id);
    setEditSellerId(order.seller_id);
    setEditPaymentStatus(order.payment_status);
    setRemovedItemIds([]);
    setEditItems(
      (order.items || []).map((it) => ({
        originalId: it.id,
        originalProductId: it.product_id,
        originalQuantity: Number(String(it.quantity).replace(",", ".")),
        originalNumber: it.number,
        product_id: it.product_id,
        quantity: maskStock(String(it.quantity)),
        unit_price: String(it.unit_price || "0"),
      }))
    );
    setIsEditingDraft(true);
  };

  const handleEditProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const priceStr = prod
      ? typeof prod.sale_price === "object" && prod.sale_price !== null
        ? String((prod.sale_price as Record<string, unknown>).amount || "0")
        : String(prod.sale_price || "0")
      : "0";

    setEditItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? { ...item, product_id: productId, unit_price: priceStr }
          : item
      )
    );
  };

  const handleEditQuantityChange = (index: number, rawValue: string) => {
    const masked = maskStock(rawValue);
    setEditItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, quantity: masked } : item
      )
    );
  };

  const handleAddEditItem = () => {
    setEditItems((prev) => [
      ...prev,
      { product_id: "", quantity: "1", unit_price: "0" },
    ]);
  };

  const handleRemoveEditItem = (index: number) => {
    const target = editItems[index];
    if (target?.originalId) {
      setRemovedItemIds((prev) => [...prev, target.originalId!]);
    }
    setEditItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveDraft = async () => {
    const payload: UpdateSalesOrderRequest = {};

    if (editClientId && editClientId !== order.client_id) {
      payload.client_id = editClientId;
    }
    if (editSellerId && editSellerId !== order.seller_id) {
      payload.seller_id = editSellerId;
    }
    if (editPaymentStatus !== order.payment_status) {
      payload.payment_status = editPaymentStatus;
    }

    const toAdd: NonNullable<UpdateSalesOrderRequest["items"]>["to_add"] = [];
    const toUpdate: NonNullable<UpdateSalesOrderRequest["items"]>["to_update"] = [];
    const toRemove: string[] = [...removedItemIds];

    editItems.forEach((item, idx) => {
      const itemNumber = idx + 1;
      const qty = Number(item.quantity.replace(",", "."));
      if (!item.product_id || Number.isNaN(qty) || qty <= 0) return;

      if (!item.originalId) {
        toAdd.push({
          product_id: item.product_id,
          number: itemNumber,
          quantity: qty,
        });
      } else if (item.product_id !== item.originalProductId) {
        toRemove.push(item.originalId);
        toAdd.push({
          product_id: item.product_id,
          number: itemNumber,
          quantity: qty,
        });
      } else if (
        qty !== item.originalQuantity ||
        itemNumber !== item.originalNumber
      ) {
        toUpdate.push({
          id: item.originalId,
          number: itemNumber,
          quantity: qty,
        });
      }
    });

    if (toAdd.length > 0 || toUpdate.length > 0 || toRemove.length > 0) {
      payload.items = {
        ...(toAdd.length > 0 ? { to_add: toAdd } : {}),
        ...(toUpdate.length > 0 ? { to_update: toUpdate } : {}),
        ...(toRemove.length > 0 ? { to_remove: toRemove } : {}),
      };
    }

    if (Object.keys(payload).length === 0) {
      setIsEditingDraft(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: order.id, data: payload });
      setIsEditingDraft(false);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(order.id);
    } catch {
      // Erro tratado no hook
    }
  };

  const handleReopen = async () => {
    try {
      const res = await reopenMutation.mutateAsync(order.id);
      if (res?.data?.order?.id) {
        router.push(`/sales-orders/${res.data.order.id}`);
      }
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

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(order.id);
      setShowDeleteDialog(false);
      router.push("/sales-orders");
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
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sales-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={currentStatus.variant} className="text-xs">
              {currentStatus.label}
            </Badge>
            <Badge
              variant={order.payment_status === "paid" ? "default" : "outline"}
              className="text-xs"
            >
              {order.payment_status === "paid" ? "Pago" : "Pagamento Pendente"}
            </Badge>
            {order.replaces_order_id && (
              <Badge variant="outline" className="text-xs gap-1">
                <History className="h-3 w-3" />
                <Link
                  href={`/sales-orders/${order.replaces_order_id}`}
                  className="hover:underline"
                >
                  Substitui pedido anterior
                </Link>
              </Badge>
            )}
          </div>
        </div>

        {/* Botões de Ação do Ciclo de Vida */}
        {(canEdit || canDelete) && (
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && order.status === "draf" && !isEditingDraft && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startEditingDraft}
                  disabled={isActionPending}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Rascunho
                </Button>

                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleConfirm}
                  disabled={isActionPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Pedido
                </Button>
              </>
            )}

            {canEdit &&
              (order.status === "confirmed" || order.status === "cancelled") && (
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

            {canEdit && order.status !== "cancelled" && !isEditingDraft && (
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

            {canDelete && order.status === "draf" && !isEditingDraft && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isActionPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Painel de Edição do Rascunho */}
      {isEditingDraft && order.status === "draf" && (
        <Card className="border-primary/40 bg-card shadow-md">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" />
              Editando Rascunho do Pedido #{order.number}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingDraft(false)}
              disabled={isActionPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar Edição
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Cliente</Label>
                <Select
                  value={editClientId}
                  onValueChange={setEditClientId}
                  disabled={isActionPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.legal_name} ({c.trade_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Vendedor</Label>
                <Select
                  value={editSellerId}
                  onValueChange={setEditSellerId}
                  disabled={isActionPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.trade_name} ({s.legal_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status de Pagamento</Label>
                <Select
                  value={editPaymentStatus}
                  onValueChange={(val) =>
                    setEditPaymentStatus(val as PaymentStatus)
                  }
                  disabled={isActionPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pagamento Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Itens do Rascunho
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddEditItem}
                  disabled={isActionPending}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Adicionar Item
                </Button>
              </div>

              {editItems.map((item, idx) => {
                const qty = Number(item.quantity.replace(",", ".") || 0);
                const price = Number(item.unit_price.replace(",", ".") || 0);
                return (
                  <div
                    key={item.originalId || `new-${idx}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-md border border-border bg-muted/15"
                  >
                    <div className="md:col-span-1 font-mono text-xs text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <div className="md:col-span-6">
                      <Select
                        value={item.product_id}
                        onValueChange={(val) =>
                          handleEditProductChange(idx, val)
                        }
                        disabled={isActionPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        value={item.quantity}
                        onChange={(e) =>
                          handleEditQuantityChange(idx, e.target.value)
                        }
                        placeholder="Qtd"
                        disabled={isActionPending}
                      />
                    </div>
                    <div className="md:col-span-2 text-right text-xs font-semibold">
                      <MoneyDisplay value={qty * price} />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      {editItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveEditItem(idx)}
                          disabled={isActionPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDraft(false)}
                disabled={isActionPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isActionPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    {formatQuantity(it.quantity)}
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

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Rascunho de Pedido"
        description={`Tem certeza que deseja excluir o rascunho do pedido #${order.number}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir Rascunho"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
