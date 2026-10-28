import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { BrandTable } from "@/features/brands/components/brand-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Marcas | Apollo System",
  description: "Gerenciamento de marcas de produtos do catálogo",
};

export default function BrandsPage() {
  return (
    <PermissionGuard
      permission="brand.view"
      title="Marcas Restrito"
      description="Você não possui permissão para visualizar a listagem de marcas."
    >
      <div className="space-y-6">
        <PageHeader
          title="Marcas de Produtos"
          description="Organize seu catálogo por fabricantes e marcas de distribuição"
        >
          <Can permission="brand.create">
            <Button asChild>
              <Link href="/brands/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Marca
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <BrandTable />
      </div>
    </PermissionGuard>
  );
}
