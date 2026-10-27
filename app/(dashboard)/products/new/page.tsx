import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ProductForm } from "@/features/products/components/product-form";

import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Novo Produto | Apollo System",
  description: "Cadastro de novo produto no Apollo System",
};

export default function NewProductPage() {
  return (
    <PermissionGuard
      permission="product.create"
      title="Cadastro Não Permitido"
      description="Você não possui permissão para cadastrar novos produtos."
    >
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Novo Produto"
          description="Preencha as informações do item para adicioná-lo ao catálogo"
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <ProductForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
