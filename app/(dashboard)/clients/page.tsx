import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/features/clients/components/client-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Clientes | Apollo System",
  description: "Gerenciamento de clientes e compradores",
};

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie os compradores, documentos fiscais e múltiplos endereços de entrega"
      >
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </PageHeader>

      <ClientTable />
    </div>
  );
}
