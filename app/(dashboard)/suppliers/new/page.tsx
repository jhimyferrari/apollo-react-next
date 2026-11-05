import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { SupplierForm } from "@/features/suppliers/components/supplier-form";
import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Novo Fornecedor | Apollo System",
  description: "Cadastre um novo fornecedor no Apollo System",
};

export default function NewSupplierPage() {
  return (
    <PermissionGuard
      permission="supplier.create"
      title="Cadastro Não Permitido"
      description="Você não possui permissão para cadastrar novos fornecedores."
    >
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Novo Fornecedor"
          description="Preencha os dados do fornecedor. Você poderá cadastrar endereços após salvar."
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <SupplierForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
