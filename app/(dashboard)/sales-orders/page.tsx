import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { SalesOrderTable } from "@/features/sales-orders/components/sales-order-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Pedidos de Venda | Apollo System",
  description: "Gerenciamento de pedidos de venda e faturamento comercial",
};

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Venda"
        description="Gerencie ordens de venda, confirmações, cancelamentos e valores negociados"
      >
        <Button asChild>
          <Link href="/sales-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido de Venda
          </Link>
        </Button>
      </PageHeader>

      <SalesOrderTable />
    </div>
  );
}
