import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ClientForm } from "@/features/clients/components/client-form";

export const metadata: Metadata = {
  title: "Novo Cliente | Apollo System",
  description: "Cadastre um novo cliente no Apollo System",
};

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Novo Cliente"
        description="Preencha os dados do cliente. Você poderá adicionar endereços após salvar."
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <ClientForm />
      </div>
    </div>
  );
}
