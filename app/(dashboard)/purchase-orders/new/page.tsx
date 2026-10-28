import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/purchase-order-form";

export const metadata: Metadata = {
  title: "Novo Pedido de Compra | Apollo System",
  description: "Emissão de novo pedido de compra para fornecedor",
};

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Pedido de Compra"
        description="Selecione o fornecedor e monte os itens da ordem de compra com precisão de preços"
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <PurchaseOrderForm />
      </div>
    </div>
  );
}
