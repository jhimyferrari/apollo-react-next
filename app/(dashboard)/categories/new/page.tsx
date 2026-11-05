import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { CategoryForm } from "@/features/categories/components/category-form";
import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Nova Categoria | Apollo System",
  description: "Cadastre uma nova categoria de produto",
};

export default function NewCategoryPage() {
  return (
    <PermissionGuard
      permission="category.create"
      title="Cadastro Não Permitido"
      description="Você não possui permissão para cadastrar novas categorias."
    >
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Nova Categoria"
          description="Preencha o nome e descrição da categoria"
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <CategoryForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
