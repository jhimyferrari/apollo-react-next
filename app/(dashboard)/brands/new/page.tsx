import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { BrandForm } from "@/features/brands/components/brand-form";

import { PermissionGuard } from "@/components/common/permission-guard";

export const metadata: Metadata = {
  title: "Nova Marca | Apollo System",
  description: "Cadastre uma nova marca de produto",
};

export default function NewBrandPage() {
  return (
    <PermissionGuard
      permission="brand.create"
      title="Cadastro Não Permitido"
      description="Você não possui permissão para cadastrar novas marcas."
    >
      <div className="space-y-6">
        <PageHeader
          title="Cadastrar Nova Marca"
          description="Preencha o nome e informações da marca para associá-la aos produtos"
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <BrandForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
