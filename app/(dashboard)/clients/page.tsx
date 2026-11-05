import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/features/clients/components/client-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Clientes | Apollo System",
  description: "Gerenciamento de clientes e compradores",
};

export default function ClientsPage() {
  return (
    <PermissionGuard
      permission="client.view"
      title="Clientes Restrito"
      description="Você não possui permissão para visualizar a listagem de clientes."
    >
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Gerencie os compradores, documentos fiscais e múltiplos endereços de entrega"
        >
          <Can permission="client.create">
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <ClientTable />
      </div>
    </PermissionGuard>
  );
}
