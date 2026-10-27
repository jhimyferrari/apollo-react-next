import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { SupplierForm } from "@/features/suppliers/components/supplier-form";

export const metadata: Metadata = {
  title: "Novo Fornecedor | Apollo System",
  description: "Cadastre um novo fornecedor no Apollo System",
};

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Novo Fornecedor"
        description="Preencha os dados do fornecedor. Você poderá cadastrar endereços após salvar."
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <SupplierForm />
      </div>
    </div>
  );
}
