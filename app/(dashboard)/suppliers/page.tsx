import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { SupplierTable } from "@/features/suppliers/components/supplier-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Fornecedores | Apollo System",
  description: "Gerenciamento de fornecedores e parceiros de suprimentos",
};

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie os parceiros de fornecimento, documentos fiscais e pedidos de compra"
      >
        <Button asChild>
          <Link href="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Link>
        </Button>
      </PageHeader>

      <SupplierTable />
    </div>
  );
}
