import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PurchaseOrderTable } from "@/features/purchase-orders/components/purchase-order-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedidos de Compra | Apollo System",
  description: "Gerenciamento de pedidos de compra e suprimentos",
};

export default function PurchaseOrdersPage() {
  return (
    <PermissionGuard
      permission="purchase-order.view"
      title="Pedidos de Compra Restrito"
      description="Você não possui permissão para visualizar a listagem de pedidos de compra."
    >
      <div className="space-y-6">
        <PageHeader
          title="Pedidos de Compra"
          description="Gerencie ordens de compra emitidas para seus fornecedores de mercadorias"
        >
          <Can permission="purchase-order.create">
            <Button asChild>
              <Link href="/purchase-orders/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido de Compra
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <PurchaseOrderTable />
      </div>
    </PermissionGuard>
  );
}
