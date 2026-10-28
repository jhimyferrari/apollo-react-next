"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/common/loading-skeleton";
import { BrandForm } from "@/features/brands/components/brand-form";
import { useBrand } from "@/features/brands/hooks/use-brands";
import { PermissionGuard } from "@/components/common/permission-guard";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data, isLoading, isError, error, refetch } = useBrand(id);
  const brand = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Marca"
          description="Carregando dados da marca..."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="space-y-6">
        <PageHeader title="Marca não encontrada" />
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-destructive text-lg">
            Não foi possível carregar a marca
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {error?.message || "O item solicitado não existe ou foi removido."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/brands">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Link>
            </Button>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="brand.update"
      title="Edição Não Permitida"
      description="Você não possui permissão para editar os dados desta marca."
    >
      <div className="space-y-6">
        <PageHeader
          title={`Editar Marca: ${brand.name}`}
          description={`Código #${brand.number} • Atualize as informações desejadas`}
        />

        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <BrandForm initialData={brand} />
        </div>
      </div>
    </PermissionGuard>
  );
}
