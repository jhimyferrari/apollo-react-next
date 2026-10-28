import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { SellerForm } from "@/features/sellers/components/seller-form";

export const metadata: Metadata = {
  title: "Novo Vendedor | Apollo System",
  description: "Cadastre um novo vendedor no Apollo System",
};

export default function NewSellerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Novo Vendedor"
        description="Preencha os dados cadastrais do vendedor. Endereços poderão ser adicionados após salvar."
      />

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <SellerForm />
      </div>
    </div>
  );
}
