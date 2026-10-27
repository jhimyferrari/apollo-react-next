import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { UserForm } from "@/features/users/components/user-form";

export const metadata: Metadata = {
  title: "Novo Usuário | Apollo System",
  description: "Cadastre um novo usuário operador no Apollo System",
};

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Novo Usuário"
        description="Defina os dados de autenticação e atribua as permissões de acesso por domínio"
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <UserForm />
      </div>
    </div>
  );
}
