import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { SellerTable } from "@/features/sellers/components/seller-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Vendedores | Apollo System",
  description: "Gerenciamento da equipe de vendedores e representantes comerciais",
};

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendedores & Representantes"
        description="Gerencie a equipe comercial responsável pela emissão de pedidos de venda"
      >
        <Button asChild>
          <Link href="/sellers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </Link>
        </Button>
      </PageHeader>

      <SellerTable />
    </div>
  );
}
