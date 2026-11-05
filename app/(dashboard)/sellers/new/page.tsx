import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { SellerForm } from "@/features/sellers/components/seller-form";
import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Novo Vendedor | Apollo System",
  description: "Cadastre um novo vendedor no Apollo System",
};

export default function NewSellerPage() {
  return (
    <PermissionGuard
      permission="seller.create"
      title="Cadastro Não Permitido"
      description="Você não possui permissão para cadastrar novos vendedores."
    >
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Novo Vendedor"
          description="Preencha os dados cadastrais do vendedor. Endereços poderão ser adicionados após salvar."
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <SellerForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
