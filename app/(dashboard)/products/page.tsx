import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/features/products/components/product-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Produtos | Apollo System",
  description: "Gerenciamento de produtos, estoque e preços do catálogo",
};

export default function ProductsPage() {
  return (
    <PermissionGuard
      permission="product.view"
      title="Catálogo Restrito"
      description="Você não possui permissão para visualizar o catálogo de produtos."
    >
      <div className="space-y-6">
        <PageHeader
          title="Produtos & Catálogo"
          description="Gerencie itens, preços de custo e venda, códigos fiscais (NCM) e estoque"
        >
          <Can permission="product.create">
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <ProductTable />
      </div>
    </PermissionGuard>
  );
}
