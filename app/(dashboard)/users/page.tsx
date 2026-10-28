import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/features/users/components/user-table";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Usuários & Permissões | Apollo System",
  description: "Gerenciamento de operadores e controle de permissões por domínio",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários & Permissões"
        description="Gerencie os operadores do sistema e configure privilégios de acesso detalhados por domínio"
      >
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </PageHeader>

      <UserTable />
    </div>
  );
}
