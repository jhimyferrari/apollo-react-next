import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { SellerTable } from "@/features/sellers/components/seller-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Vendedores | Apollo System",
  description: "Gerenciamento da equipe de vendedores e representantes comerciais",
};

export default function SellersPage() {
  return (
    <PermissionGuard
      permission="seller.view"
      title="Vendedores Restrito"
      description="Você não possui permissão para visualizar a listagem de vendedores."
    >
      <div className="space-y-6">
        <PageHeader
          title="Vendedores & Representantes"
          description="Gerencie a equipe comercial responsável pela emissão de pedidos de venda"
        >
          <Can permission="seller.create">
            <Button asChild>
              <Link href="/sellers/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Vendedor
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <SellerTable />
      </div>
    </PermissionGuard>
  );
}
