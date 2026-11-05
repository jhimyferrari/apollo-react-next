import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/features/users/components/user-table";
import { Can } from "@/components/common/can";
import { PermissionGuard } from "@/components/common/permission-guard";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Usuários & Permissões | Apollo System",
  description: "Gerenciamento de operadores e controle de permissões por domínio",
};

export default function UsersPage() {
  return (
    <PermissionGuard
      permission="user.view"
      title="Usuários Restrito"
      description="Você não possui permissão para visualizar a listagem de usuários."
    >
      <div className="space-y-6">
        <PageHeader
          title="Usuários & Permissões"
          description="Gerencie os operadores do sistema e configure privilégios de acesso detalhados por domínio"
        >
          <Can permission="user.create">
            <Button asChild>
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Link>
            </Button>
          </Can>
        </PageHeader>

        <UserTable />
      </div>
    </PermissionGuard>
  );
}
