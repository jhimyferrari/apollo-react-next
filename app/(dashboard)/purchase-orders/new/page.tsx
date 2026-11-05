import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/purchase-order-form";
import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Novo Pedido de Compra | Apollo System",
  description: "Emissão de novo pedido de compra para fornecedor",
};

export default function NewPurchaseOrderPage() {
  return (
    <PermissionGuard
      permission="purchase-order.create"
      title="Emissão Não Permitida"
      description="Você não possui permissão para emitir novos pedidos de compra."
    >
      <div className="space-y-6">
        <PageHeader
          title="Novo Pedido de Compra"
          description="Selecione o fornecedor e monte os itens da ordem de compra com precisão de preços"
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <PurchaseOrderForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
