import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { SalesOrderForm } from "@/features/sales-orders/components/sales-order-form";

export const metadata: Metadata = {
  title: "Novo Pedido de Venda | Apollo System",
  description: "Cadastre um novo pedido de venda comercial",
};

export default function NewSalesOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Pedido de Venda"
        description="Selecione o cliente, o vendedor responsável e monte os itens do pedido com valores precisos"
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <SalesOrderForm />
      </div>
    </div>
  );
}
