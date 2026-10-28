import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PurchaseOrderTable } from "@/features/purchase-orders/components/purchase-order-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedidos de Compra | Apollo System",
  description: "Gerenciamento de pedidos de compra e suprimentos",
};

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Compra"
        description="Gerencie ordens de compra emitidas para seus fornecedores de mercadorias"
      >
        <Button asChild>
          <Link href="/purchase-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido de Compra
          </Link>
        </Button>
      </PageHeader>

      <PurchaseOrderTable />
    </div>
  );
}
